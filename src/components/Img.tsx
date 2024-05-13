import { AspectRatio } from "./ui/aspect-ratio"

function Img({ src, alt, onClick }: { src?: string; alt?: string; onClick?: () => {} }) {
  src = src || "/image.svg"
  return (
    <AspectRatio ratio={16 / 9} onClick={onClick}>
      <img className="rounded-md object-cover h-full m-x-auto" src={src} alt={alt} />
    </AspectRatio>
  )
}

export default Img
