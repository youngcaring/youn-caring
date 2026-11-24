"use client";

import { useState } from "react";

export default function NewsImagePicker() {
  const [files, setFiles] = useState<string[]>([]);
  const [primary, setPrimary] = useState(0);

  return (
    <div className="mt-5 text-left">
      <input id="news-images" name="images" type="file" multiple required
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => { setFiles(Array.from(event.target.files ?? [], (file) => file.name)); setPrimary(0); }}
        className="block w-full min-w-0 rounded-xl border border-[#dbe4e5] bg-white text-xs text-[#5f6d70] file:mr-3 file:cursor-pointer file:border-0 file:bg-[#e7f6f7] file:px-4 file:py-3 file:font-bold file:text-[#007d88]" />
      {files.length > 0 && (
        <fieldset className="mt-4 space-y-2 text-sm">
          <legend className="mb-2 font-semibold text-[#101719]">Image principale</legend>
          <p className="text-xs text-[#5f6d70]">Elle sera affichée en premier sur le site.</p>
          {files.map((name, index) => (
            <label key={`${index}-${name}`} className="flex items-center gap-2 break-all">
              <input type="radio" name="primaryImage" value={index} checked={primary === index} onChange={() => setPrimary(index)} />
              {name}
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
