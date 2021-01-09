const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
const throttle = function (fn, delay) {
  let timer
  return function (...args) {
    // console.log(this)
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        // console.log(this)
        fn.apply(this, args)
      }, delay)
    }
  }
}

export { throttle, debounce }
