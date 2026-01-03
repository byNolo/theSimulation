import { useEffect, useState } from 'react'

export default function useFetch<T>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(url, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { 
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch(e => { 
        if (!cancelled) {
          setError(String(e))
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, error, loading }
}
