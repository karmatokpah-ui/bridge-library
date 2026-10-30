import {useEffect,useState} from 'react';
import {Download,Printer} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {type IssuedCertificate as CertificateRecord,createCertificatePdf,certificateFilename} from '@/lib/certificate-pdf';
import {downloadFile} from '@/lib/file-download';
import shield from '@/assets/bridgelib-shield.png';
export function IssuedCertificate({record}:{record:CertificateRecord}){
 const [blob,setBlob]=useState<Blob|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let live=true;setBlob(null);setError('');void createCertificatePdf(record).then(bytes=>{if(live)setBlob(new Blob([bytes],{type:'application/pdf'}));}).catch(()=>{if(live)setError('The certificate PDF could not be prepared.');});return()=>{live=false;};},[record]);
 return <><section className="bl-issued-certificate" aria-label="Issued completion certificate"><img src={shield} alt="BridgeLIB shield" width={48} height={48}/><h2>BridgeLIB</h2><p className="bl-cert-location">Liberia · Learning record</p><h3>Certificate of Completion</h3><p>This recognises</p><strong>{record.learner_name}</strong><p>for completing the published BridgeLIB lessons in</p><h4>{record.subject_name}</h4><p>Issued {new Date(record.issued_at).toISOString().slice(0,10)}</p><small>Record ID: {record.id}</small><p className="bl-cert-disclaimer">Issued by BridgeLIB. Not an official WASSCE or school exam certificate.</p></section><div className="bl-study-step-controls bl-cert-actions"><Button disabled={!blob} onClick={()=>{if(blob)downloadFile(blob,certificateFilename(record));}}><Download size={16}/>{blob?'Download certificate PDF':'Preparing PDF…'}</Button><Button variant="outline" onClick={()=>window.print()}><Printer size={16}/>Print certificate</Button></div>{error&&<p role="alert">{error}</p>}</>;
}