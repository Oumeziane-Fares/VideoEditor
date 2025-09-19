// src/pages/EditorPage.tsx

import React from 'react';
import { VideoTranslationEditor } from '../components/VideoTranslationEditor/VideoTranslationEditor';
import BreadCrumb from "../pages/UiElements/BreadCrumb";// Corrected path based on App.tsx

const EditorPage: React.FC = () => {
  return (
    <>
      <BreadCrumb title="Translation Editor" />
      <div className="flex flex-col gap-10 pt-4">
        <VideoTranslationEditor />
      </div>
    </>
  );
};

export default EditorPage;