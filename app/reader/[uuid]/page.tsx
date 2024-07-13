import PDFViewer from '@/components/Reader/PDFViewer';

export default function Page({ params }: { params: { uuid: string } }){
    return (
        <PDFViewer uuid={params.uuid} />
    )
}