import { Button } from "@/components/ui/button"
import { dialog, path, shell } from "@tauri-apps/api"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import { useEffect, useState } from "react"
import Img from "./components/Img"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import storage from "./lib/localStorage"
import { generateTime, timeToTimeStamp } from "./lib/utils"

function App() {
  interface Form {
    time?: string
    imgPath?: string
    img?: string
    now?: number
  }
  const [form, setForm] = useState<Form>({})
  async function selectFile() {
    const imgPath = (await dialog.open({
      multiple: false, // 是否允许选择多个文件
      directory: false, // 是否选择文件夹而不是文件
      filters: [{ name: "All Files", extensions: ["*"] }], // 文件筛选器
    })) as string | null

    if (!imgPath) return
    // resolve 默认位置是 src-tauri 目录
    setForm(obj => ({ ...obj, img: convertFileSrc(imgPath), imgPath }))
  }

  let timeID: number | NodeJS.Timeout
  function refresh() {
    if (!imgList.length) return
    clearTimeout(timeID)
    const nextIndex = imgList.findIndex(f => timeToTimeStamp(f.time) > new Date().getTime())
    if (nextIndex !== -1) setWallpaper(imgList[nextIndex])
    else setWallpaper(imgList[0])

    // 立即设置当前时间段的壁纸
    const curIndex = nextIndex - 1 >= 0 ? nextIndex - 1 : imgList.length - 1
    const current: Form = { ...imgList[curIndex] }
    current.time = undefined
    setWallpaper(current)
  }
  async function changeWallpaper(target: Form) {
    const shellPath = await path.resolve("../public/ChangeWallpaper.ps1")
    const args = ["-File", shellPath, target.imgPath!]
    const command = new shell.Command("run-powershell", args)
    await command.execute()
  }

  function setWallpaper(target: Form) {
    if (target.time) {
      const date = new Date()
      const curDate = new Date()
      const [h, m, s] = target.time.split(":")
      let delay = date.setHours(+h, +m, +s, 0) - curDate.getTime()
      if (delay < 0) delay = date.setDate(date.getDate() + 1) - curDate.getTime()

      timeID = setTimeout(() => {
        changeWallpaper(target)
        refresh()
      }, delay)
      return
    }
    changeWallpaper(target)
  }

  const [imgList, setImgList] = useState<Required<Form>[]>([])
  useEffect(() => {
    const history: Required<Form>[] = storage.getItem("imgList") || []
    setImgList(() => history)
  }, [])
  useEffect(() => {
    refresh()
  }, [imgList])
  function onAddWallpaper() {
    const current = { ...form, now: new Date().getTime() } as Required<Form>
    setImgList(arr => {
      const newArr = [...arr, current]
      newArr.sort((a, b) => timeToTimeStamp(a.time) - timeToTimeStamp(b.time))
      storage.setItem("imgList", newArr)
      return newArr
    })
    refresh()
  }
  function onSelectTime(value: string) {
    setForm(obj => ({ ...obj, time: value }))
  }
  const timeOptions = generateTime()
  function onRemove(now: number) {
    setImgList(arr => {
      const newArr = arr.filter(f => f.now !== now)
      storage.setItem("imgList", newArr)
      return newArr
    })
    refresh()
  }
  function openDialog() {
    setForm({})
  }
  return (
    <>
      {imgList.map(item => {
        return (
          <div className="flex items-center" key={item.now}>
            <div className="flex-1">
              <Img src={item.img} />
            </div>
            <div className="w-sm">
              <span>{item.time}生效</span>
              <Button variant="destructive" onClick={() => onRemove(item.now)}>
                删除
              </Button>
            </div>
          </div>
        )
      })}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={openDialog}>
            添加定时更换壁纸任务
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加壁纸</DialogTitle>
            <DialogDescription>添加壁纸和时间, 每天的这个时间会自动设置该壁纸</DialogDescription>
          </DialogHeader>
          <Select onValueChange={onSelectTime}>
            <SelectTrigger>
              <SelectValue placeholder="选择时间" />
            </SelectTrigger>
            <SelectContent className="h-[260px]">
              <SelectGroup>
                {timeOptions.map(time => {
                  return (
                    <SelectItem value={time} key={time}>
                      {time}
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Img src={form.img} onClick={selectFile} />

          <DialogFooter>
            <DialogClose asChild>{form.img && form.time && <Button onClick={onAddWallpaper}>添加</Button>}</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default App
