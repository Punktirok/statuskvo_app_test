const toIconMap = (modules) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, module]) => {
      const filename = path.split('/').pop() || ''
      const key = filename.replace('.png', '')
      return [key, module]
    }),
  )

const categoryIconModules = import.meta.glob('../assets/icons/category/*.png', {
  eager: true,
  import: 'default',
})
const lessonTypeIconModules = import.meta.glob(
  '../assets/icons/lessonType/*.png',
  {
    eager: true,
    import: 'default',
  },
)
const interfaceIconModules = import.meta.glob('../assets/icons/interface/*.png', {
  eager: true,
  import: 'default',
})

const categoryIcons = toIconMap(categoryIconModules)
const lessonTypeIcons = toIconMap(lessonTypeIconModules)
const interfaceIcons = toIconMap(interfaceIconModules)

export const getCategoryIcon = (iconKey) => categoryIcons[iconKey]
export const getLessonTypeIcon = (iconKey) => lessonTypeIcons[iconKey]
export const getInterfaceIcon = (iconKey) => interfaceIcons[iconKey]
