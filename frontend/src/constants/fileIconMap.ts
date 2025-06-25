import { SvgIcons } from "@/components/SvgIcons";
import { JSX } from "react";


const extensionToIconMap: Record<string, () => JSX.Element> = {
  // Images
  jpg: SvgIcons.ImageFileIcon,
  jpeg: SvgIcons.ImageFileIcon,
  png: SvgIcons.ImageFileIcon,
  gif: SvgIcons.ImageFileIcon,
  webp: SvgIcons.ImageFileIcon,

  // Audio
  mp3: SvgIcons.AudioFileIcon,
  wav: SvgIcons.AudioFileIcon,

  // Video
  mp4: SvgIcons.VideoFileIcon,
  mov: SvgIcons.VideoFileIcon,

  // Docs
  pdf: SvgIcons.PdfFileIcon,
  zip: SvgIcons.ZipFileIcon,
  txt: SvgIcons.TextFileIcon,
  xls: SvgIcons.XlsFileIcon,
  xlsx: SvgIcons.XlsFileIcon,
  csv: SvgIcons.XlsFileIcon,
};

export default extensionToIconMap;
