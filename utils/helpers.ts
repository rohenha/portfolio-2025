export const formatLink = (link: any): any => {
  const attributes: Record<string, string> = {}

  if (link.external) {
    attributes['target'] = '_blank'
  }

  return attributes
}