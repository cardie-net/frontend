import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function Page() {
  const t = useTranslations('HomePage')

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t('title')}</h1>
          <p>{t('description1')}</p>
          <p>{t('description2')}</p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('darkMode') }} />
      </div>
    </div>
  )
}
