import { Tldraw, Editor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";

interface TldrawCanvasProps {
  canvasId: string;
  initialData ?: any;
  onSave? : (data:any) => void;
}

export default function TldrawCanvas({ canvasId }: TldrawCanvasProps) {
    const [editor, setEditor] = useState<Editor|null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const data = loadCanvasData(canvasId);
        if (editor && data) {
            editor.loadSnapshot(data);
        }
    }, [canvasId])

    function loadCanvasData(canvasId: string){
        try {
            const items = localStorage.getItem(`canvas-${canvasId}`)
            const data = items ? JSON.parse(items) : {};
            return data;
            // You can now use 'data' as needed
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    function saveCanvasData(canvasId: string, data: any){
        try{
            localStorage.setItem(`canvas-${canvasId}`, JSON.stringify(data))
        } catch (error){
            console.log(error);
        }
    }

    const handleMount = (editor: Editor) => {
        setEditor(editor);
        // Load existing data
        const data = loadCanvasData(canvasId);
        if (data && Object.keys(data).length > 0) {
          editor.loadSnapshot(data);
        }
        // Listen for changes
        editor.on('change', () => {
            setHasUnsavedChanges(true);
            // Auto-save after 2 seconds of inactivity
            const timeoutId = setTimeout(() => {
                const data = editor.getSnapshot();
                saveCanvasData(canvasId, data);
                setHasUnsavedChanges(false);
            }, 2000);
            
            return () => clearTimeout(timeoutId);
        });
    };

    return (
        <div className="h-screen w-full">
            <Tldraw
                onMount={handleMount}
            />
        </div>
    );
    



}