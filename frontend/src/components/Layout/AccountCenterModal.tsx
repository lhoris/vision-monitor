import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/Common'
import { AccountProfile } from '@/pages/AccountProfile'
import { HelpSupport } from '@/pages/HelpSupport'

export type AccountTab = 'profile' | 'help'

interface AccountCenterModalProps {
  isOpen: boolean
  initialTab: AccountTab
  onClose: () => void
  onLogout: () => void
}

export function AccountCenterModal({ isOpen, initialTab, onClose, onLogout }: AccountCenterModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab)
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab)
  }, [initialTab, isOpen])
  const tabs: Array<{ id: AccountTab; label: string }> = [
    { id: 'profile', label: t('account.menu.profile') },
    { id: 'help', label: t('account.menu.help') },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('account.dialogTitle')}
      className="flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden"
      bodyClassName="min-h-0 overflow-y-auto p-0"
    >
      <div className="flex min-h-0 flex-col">
        <div role="tablist" aria-label={t('account.dialogTabs')} className="flex shrink-0 gap-1 border-b border-gray-200 px-4 pt-3 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`account-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="account-tab-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-700 dark:text-blue-300' : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div id="account-tab-panel" role="tabpanel" aria-labelledby={`account-tab-${activeTab}`} className="min-h-0 flex-1">
          {activeTab === 'profile' ? <AccountProfile /> : null}
          {activeTab === 'help' ? <HelpSupport /> : null}
        </div>
        <div className="flex shrink-0 justify-end border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <button type="button" onClick={onLogout} className="px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40">
            {t('account.logout')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
