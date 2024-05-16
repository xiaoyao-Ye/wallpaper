import CustomStorage from "./webStorage"

const storage = new CustomStorage()

storage.bootStrap({
  mode: "local",
  timeout: Infinity,
  // timeout: 1000 * 60 * 60 * 24 * 7,
})

export default storage
