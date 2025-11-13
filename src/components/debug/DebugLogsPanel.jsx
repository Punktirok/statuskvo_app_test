import { useState } from 'react'

const getLogs = () => {
  if (typeof window === 'undefined') {
    return []
  }
  return window.__SK_DEBUG_LOGS__ ?? []
}

function DebugLogsPanel({ visible, onClose }) {
  const [logs, setLogs] = useState(getLogs())

  if (!visible) {
    return null
  }

  const handleRefresh = () => {
    setLogs(getLogs())
  }

  const handleCopy = async () => {
    const text = logs.map((log) => JSON.stringify(log, null, 2)).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      // eslint-disable-next-line no-alert
      window.alert('Логи скопированы в буфер обмена')
    } catch (error) {
      // eslint-disable-next-line no-alert
      window.alert('Не удалось скопировать логи. Скопируйте вручную.')
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-72 overflow-auto bg-black/85 px-4 pb-4 pt-3 text-xs text-white">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span>Debug Logs</span>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded bg-white/15 px-2 py-1 text-xs"
        >
          Обновить
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded bg-white/15 px-2 py-1 text-xs"
        >
          Скопировать
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded bg-white/15 px-2 py-1 text-xs"
        >
          Закрыть
        </button>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-[11px]">
        {logs.length
          ? logs.map((entry) => JSON.stringify(entry, null, 2)).join('\n\n')
          : 'Логи отсутствуют'}
      </pre>
    </div>
  )
}

export default DebugLogsPanel
