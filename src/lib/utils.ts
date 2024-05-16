import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTime() {
  const startTime = new Date()
  startTime.setHours(0, 0, 0, 0) // 设置开始时间为 00:00

  const endTime = new Date()
  endTime.setHours(23, 45, 0, 0) // 设置结束时间为 23:45

  const timeList = []

  const currentTime = new Date(startTime)

  while (currentTime <= endTime) {
    const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    timeList.push(formattedTime)

    currentTime.setMinutes(currentTime.getMinutes() + 15) // 增加 15 分钟
  }

  return timeList
}

export function timeToTimeStamp(time: string) {
  const [H, M, S] = time.split(":")
  const timeStamp = new Date().setHours(+H, +M, +S, 0)
  return timeStamp
}
