import { useTranslation } from 'react-i18next'

export function HelpSupport() {
  const { t } = useTranslation()
  const supportContact = import.meta.env.VITE_SUPPORT_CONTACT
  const version = import.meta.env.VITE_APP_VERSION || '0.0.1'

  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-gray-900 dark:text-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t('account.help.title')}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('account.help.subtitle')}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">{t('account.help.quickGuide')}</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6">
            <li>{t('account.help.guideLive')}</li>
            <li>{t('account.help.guidePlayback')}</li>
            <li>{t('account.help.guideEvents')}</li>
            <li>{t('account.help.guideProfile')}</li>
          </ol>
        </div>
        <div className="border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">{t('account.help.faq')}</h2>
          <dl className="space-y-4 text-sm">
            <div><dt className="font-medium">{t('account.help.faqStreamQuestion')}</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{t('account.help.faqStreamAnswer')}</dd></div>
            <div><dt className="font-medium">{t('account.help.faqPasswordQuestion')}</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{t('account.help.faqPasswordAnswer')}</dd></div>
          </dl>
        </div>
        <div className="border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">{t('account.help.systemInfo')}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-gray-500 dark:text-gray-400">{t('account.help.version')}</dt><dd className="mt-1 font-medium">{version}</dd></div>
            <div><dt className="text-gray-500 dark:text-gray-400">{t('account.help.environment')}</dt><dd className="mt-1 font-medium">{import.meta.env.MODE}</dd></div>
            {supportContact ? <div><dt className="text-gray-500 dark:text-gray-400">{t('account.help.supportContact')}</dt><dd className="mt-1 font-medium">{supportContact}</dd></div> : null}
          </dl>
        </div>
      </section>
    </main>
  )
}
