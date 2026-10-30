import {it,expect} from 'vitest';
import {PDFDocument} from 'pdf-lib';
import {createCertificatePdf,certificateFilename,issuedCertificateSchema} from './certificate-pdf';
const record={id:'10000000-0000-4000-8000-000000000001',subject_id:7,subject_name:'Mathematics',learner_name:'Test Learner',issued_at:'2026-10-30T09:00:00Z'};
it('requires an issued ID and date rather than fabricating a certificate',()=>{expect(issuedCertificateSchema.safeParse({...record,id:'',issued_at:''}).success).toBe(false);});
it('produces a one-page completion PDF from the given record',async()=>{const bytes=await createCertificatePdf(record);const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBe(1);expect(pdf.getSubject()).toBe('Issued BridgeLIB course completion record');expect(bytes.length).toBeGreaterThan(1000);});
it('names the download with the actual record ID',()=>expect(certificateFilename(record)).toBe('BridgeLIB-completion-Mathematics-10000000-0000-4000-8000-000000000001.pdf'));