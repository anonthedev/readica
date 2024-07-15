import Notes from '@/components/Reader/Notes';
import PDFViewer from '@/components/Reader/PDFViewer';

export default function Page({ params }: { params: { uuid: string } }){
    return (
        <main className='w-screen flex flex-row h-[calc(100vh-80px)]'>
            <PDFViewer uuid={params.uuid} />
            <Notes uuid={params.uuid}/>
        </main>
    )
}