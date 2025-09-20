// src/pages/EditorPage.tsx

import React from 'react';
import { VideoTranslationEditor } from '../components/VideoTranslationEditor/VideoTranslationEditor';
import PageMeta from '../components/common/PageMeta';

const EditorPage: React.FC = () => {
  return (
    <>
      {/* This sets the title and meta description for the page */}
      <PageMeta 
        title="Translation Editor" 
        description="A page for comparing video translations." // ✅ ADDED THIS REQUIRED PROP
      />
      
      <div className="pt-4">
        <VideoTranslationEditor />
      </div>
    </>
  );
};

export default EditorPage;