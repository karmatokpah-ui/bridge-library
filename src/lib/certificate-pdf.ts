import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { z } from 'zod';
export const issuedCertificateSchema=z.object({id:z.string().uuid(),subject_id:z.number().int().positive(),subject_name:z.string().trim().min(1),learner_name:z.string().trim().min(1),issued_at:z.iso.datetime({offset:true})});
export type IssuedCertificate=z.infer<typeof issuedCertificateSchema>;
export function certificateFilename(record:IssuedCertificate){return `BridgeLIB-completion-${record.subject_name.replace(/[^a-z0-9]+/gi,'-').slice(0,60)}-${record.id}.pdf`;}
export async function createCertificatePdf(input:IssuedCertificate){
 const record=issuedCertificateSchema.parse(input);const pdf=await PDFDocument.create();
 const page=pdf.addPage([842,595]);const regular=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const navy=rgb(.04,.16,.31),blue=rgb(.05,.3,.72),red=rgb(.82,.12,.2);
 // Document artwork, not app UI colors. No government seals or invented signatures.
 page.drawRectangle({x:24,y:24,width:794,height:547,borderColor:navy,borderWidth:2});
 page.drawRectangle({x:34,y:34,width:774,height:527,borderColor:blue,borderWidth:.6});
 function text(value:string,y:number,size:number,strong=false){const font=strong?bold:regular;let safe='';for(const char of value){try{font.encodeText(char);safe+=char;}catch{safe+='?';}}const fitted=Math.min(size,740/font.widthOfTextAtSize(safe,1));page.drawText(safe,{x:(842-font.widthOfTextAtSize(safe,fitted))/2,y,size:fitted,font,color:navy});}
 text('BridgeLIB',503,32,true);text('LIBERIA · LEARNING RECORD',473,11);
 page.drawLine({start:{x:325,y:455},end:{x:517,y:455},thickness:3,color:red});
 text('Certificate of Completion',407,29,true);text('This recognises',363,13);
 text(record.learner_name,320,28,true);text('for completing the published BridgeLIB lessons in',280,13);
 text(record.subject_name,237,25,true);
 text(`Issued: ${new Date(record.issued_at).toISOString().slice(0,10)}`,182,12);
 text(`Record ID: ${record.id}`,151,10);
 text('Issued by BridgeLIB · Course completion, not an official WASSCE or school exam certificate.',82,10);
 pdf.setTitle(`BridgeLIB completion certificate — ${record.subject_name}`);pdf.setAuthor('BridgeLIB');pdf.setSubject('Issued BridgeLIB course completion record');
 return new Uint8Array(await pdf.save());
}