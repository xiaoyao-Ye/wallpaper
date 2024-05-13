import { Button } from "@/components/ui/button"
import { dialog, path, shell } from "@tauri-apps/api"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import { useState } from "react"
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
import { generateTime } from "./lib/utils"

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

  async function setWallpaper(imgPath: string, time?: string) {
    async function changeWallpaper() {
      const shellPath = await path.resolve("../public/ChangeWallpaper.ps1")
      const args = ["-File", shellPath, imgPath]
      const command = new shell.Command("run-powershell", args)
      await command.execute()
    }
    if (time) {
      const date = new Date()
      const curDate = new Date()
      const [h, m, s] = time.split(":")
      let delay = date.setHours(+h, +m, +s, 0) - curDate.getTime()
      if (delay < 0) delay = date.setDate(date.getDate() + 1) - curDate.getTime()

      setTimeout(() => {
        changeWallpaper()
      }, delay)
      return
    }
    changeWallpaper()
  }

  const [imgList, setImgList] = useState<Required<Form>[]>([])
  function onAddWallpaper() {
    setImgList(arr => [...arr, { ...(form as Required<Form>), now: new Date().getTime() }])
    setWallpaper(form.imgPath!, form.time)
  }
  function onSelectTime(value: string) {
    setForm(obj => ({ ...obj, time: value }))
  }
  const timeOptions = generateTime()
  function onRemove(now: number) {
    setImgList(arr => arr.filter(f => f.now !== now))
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
