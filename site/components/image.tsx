"use client"

import Image from "next/image";

interface ImageProps {
  src: string;
  alt: string;
  caption?: boolean;
}

const ImageComponent = ({
  src,
  alt,
  caption = false,
}: ImageProps) => {
  return (
    <figure className="relative pb-4">
      <Image
        src={src}
        alt={alt}
        className={"bg-background border rounded-2xl overflow-hidden max-h-[530px]"}
        width={1920}
        height={1080}
      />
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
          {alt}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageComponent;