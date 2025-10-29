import React, { Suspense } from 'react';
import 'suneditor/dist/css/suneditor.min.css';
import { buttonList } from 'suneditor-react';

const SunEditor = React.lazy(() => import('suneditor-react'));

const EditorForm = ({ content, onContentChange, editorRef, onImageUploadBefore, onLoad }) => {
    return (
        <div className="w-full md:w-2/3 p-6 flex flex-col h-full overflow-y-auto">
            <label className="block text-gray-700 font-semibold mb-2">Content</label>
            <div className="flex-grow h-full">
                <Suspense fallback={<div>Loading editor...</div>}>
                    <SunEditor
                        setContents={content}
                        onChange={onContentChange}
                        getSunEditorInstance={(sunEditor) => { editorRef.current = sunEditor; }}
                        onImageUploadBefore={onImageUploadBefore}
                        onLoad={onLoad}
                        setOptions={{
                            height: 'auto',
                            minHeight: '400px',
                            buttonList: buttonList.complex,
                            pasteKeepFormats: true,
                            pasteTagsWhitelist: '.*'
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default EditorForm;
