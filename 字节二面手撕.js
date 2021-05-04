//五个模块，同时请求，超过四个或等于四个成功就返回成功，否则返回失败
//手写promiseall实现
function f(promises) {
  let resolves = [];
  let countRes = 0;
  let countRej = 0;
  return new Promise((res, rej) => {
    promises.forEach((promise, index) => {
      promise.then(
        (val) => {
          resolves[index] = val;
          countRes++;
          if (countRes >= 2 && countRes + countRej === promises.length) {
            res(resolves);
          }
        },
        (reason) => {
          countRej++;
          if (countRej >= 4) {
            rej(reason);
          }
        }
      );
    });
  });
}

//promise All实现
function load(module) {
  return new Promise((res, rej) => {
    fetch("get", module.url)
      .then((val) => {
        res(val);
      })
      .catch((e) => {
        res(new Error());
      });
  });
}
let arr = [load(a), load(b), load(c), load(d), load(e)];
function loadarr(arr) {
  return new Promise((res, rej) => {
    Promise.all(arr).then((val) => {
      val.filter((item) => item instanceof Error).length >= 2
        ? rej()
        : res(val);
    });
  });
}

//洗牌 做错了  不提了
function f2(arr) {
  let res = [];
  while (arr.length) {
    res.push(arr.pop());
    [(arr[0], arr[arr.length - 1])] = [arr[arr.length - 1], arr[0]];
  }
}
