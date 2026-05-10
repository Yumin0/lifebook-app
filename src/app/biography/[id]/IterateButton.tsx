'use client'

import { useTransition } from 'react'
import { iterateBiography } from '../actions'

export default function IterateButton({
  biographyId,
  newAvailableBatches,
}: {
  biographyId: string
  newAvailableBatches: number[]
}) {
  const [isPending, startTransition] = useTransition()

  function handleIterate() {
    startTransition(async () => {
      await iterateBiography(biographyId, newAvailableBatches)
    })
  }

  const batchLabel = newAvailableBatches.map(b => `第 ${b} 批`).join('、')

  return (
    <div>
      {isPending && (
        <p className="text-center text-xs text-[#9A8577] mb-2">正在迭代傳記，這可能需要約 10-20 秒...</p>
      )}
      <button
        onClick={handleIterate}
        disabled={isPending}
        className="w-full bg-[#3D2011] text-white rounded-2xl py-4 text-sm font-semibold disabled:opacity-40 transition-opacity"
      >
        {isPending ? '更新中...' : `加入${batchLabel}，更新傳記`}
      </button>
    </div>
  )
}
