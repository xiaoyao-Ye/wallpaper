interface StorageBootStrapConfig {
  /** 当前环境 */
  mode: "session" | "local"

  /** 超时时间 */
  timeout: number
}

interface StorageSaveFormat {
  data: any
  timestamp: number
}

export default class CustomStorage {
  /** 当前存储localStorage实例 */
  private readStorage!: Storage
  /** 当前存储实例配置["session" | "local", timeout] */
  private config!: StorageBootStrapConfig
  /** 存储总量 */
  quota!: number
  /** 使用大小 */
  usage!: number

  constructor() {
    if (!window) {
      throw new Error("当前非浏览器环境, 无法使用全局window实例!")
    }
    if (!window.localStorage) {
      throw new Error("当前环境无法使用localStorage")
    }
    if (!window.sessionStorage) {
      throw new Error("当前环境无法使用sessionStorage")
    }
  }

  /**
   * 初始化Storage
   * @param config StorageBootStrapConfig
   */
  bootStrap(config: StorageBootStrapConfig) {
    switch (config.mode) {
      case "local":
        this.readStorage = window.localStorage
        break
      case "session":
        this.readStorage = window.sessionStorage
        break
      default:
        throw new Error("当前配置项未设置mode, 请检查传入配置!")
    }
    this.config = config
  }

  /**
   * 存储当前数据
   * @param key key 设置当前数据的key
   * @param value 数据
   */
  setItem(key: string, value: unknown) {
    if (hasStringify(value)) {
      const saveData: StorageSaveFormat = {
        data: value,
        timestamp: new Date().getTime(),
      }
      // console.log("saveData", saveData)
      this.readStorage.setItem(key, JSON.stringify(saveData))
    } else {
      throw new Error("当前存储的数据不支持JSON.stringify方法,请检查当前数据!")
    }
  }

  /**
   * 获取数据
   * @param key 获取数据的key
   * @returns 返回当前key储存的数据或者null
   */
  getItem<T = any>(key: string): T | null {
    const val = this.readStorage.getItem(key)
    const content: StorageSaveFormat | null = val ? JSON.parse(val) : val
    if (content?.timestamp && new Date().getTime() - content.timestamp > this.config.timeout) {
      this.removeItem(key)
      return null
    }
    return content?.data || null
  }

  /**
   * 移除一条数据
   * @param key 移除的key
   */
  removeItem(key: string) {
    if (this.hasItem(key)) {
      this.readStorage.removeItem(key)
    }
  }

  /**
   * 获取所有key
   * @returns 返回storage当中所有的key合集
   */
  getKesy(): Array<string> {
    return Object.keys(this.readStorage)
  }

  /**
   * 获取所有的值
   * @returns 返回storage当中所有的value合集
   */
  getValues(): Array<string> {
    return Object.values(this.readStorage)
  }

  /**
   * 返回当前储存库大小
   * @returns number
   */
  size(): number {
    return this.readStorage.length
  }

  /**
   * 当前是否存在这个属性
   * @param key 判断的key
   * @returns true | false
   */
  hasItem(key: string): boolean {
    return this.readStorage.hasOwnProperty(key)
  }

  /**
   * 修改当前储存的内容
   * @param key 修改数据的key
   * @param onChange 修改函数 参数为当前key存储的数据
   * @param baseValue 基础数据 当前key的值为null时,修改函数的参数使用基础数据
   */
  changeItem<S = any>(key: string, onChange: (oldValue: S) => S | null, baseValue?: any) {
    const data = this.getItem<S>(key)
    this.setItem(key, onChange(data || baseValue))
  }

  /**
   * 获取当前储存空间,并根据过期时间进行排序
   * @returns 返回排序后的所有数据
   */
  getClearStorage() {
    const keys: string[] = this.getKesy()
    const db: { key: string; data: StorageSaveFormat }[] = []
    keys.forEach(name => {
      const item = this.getItem(name)
      item.timestamp && db.push({ key: name, data: item })
    })
    return db.sort((a, b) => a.data.timestamp - b.data.timestamp)
  }

  /**
   * 容量清理,直到满足存储大小为止
   * @param currentSize 当前存入数据大小
   */
  detectionStorageContext(currentSize: number) {
    if (this.usage + currentSize >= this.quota) {
      const storage = this.getClearStorage()
      for (let { key } of storage) {
        if (this.usage + currentSize < this.quota) break
        this.removeItem(key)
        this.initCacheSize()
      }
    }
  }

  /** 获取当前缓存情况 */
  initCacheSize() {
    if (navigator && navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        // console.log(estimate)
        this.quota = estimate.quota!
        this.usage = estimate.usage!
      })
    }
  }
}

/**
 * 判断当前值是否能够使用JSON.stringify
 * @param data 需要判断的参数
 * @returns 当前参数是否可以JSON.stringify
 */
export function hasStringify(data: any): boolean {
  if (data === undefined) return false
  if (data instanceof Function) return false
  if (isSymbol(data)) return false
  return true
}

/**
 * 判断当前类型是否symbol
 * @param data 需要判断的值
 * @returns 当前参数是否symbol
 */
export function isSymbol(data: any): boolean {
  return typeof data === "symbol"
}
