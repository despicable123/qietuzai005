function myInstanceOf(obj, fun) {
  let protoObj = obj._proto_;
  let prototypef = fun.prototype;
  while (protoObj) {
    if (protoObj === prototypef) {
      return true;
    } else {
      protoObj = protoObj._proto_;
    }
  }
  return false;
}
Function.prototype.myCall = function (obj, ...args) {
  let self = this;
  obj.p = self;
  let res = obj.p(...args);
  delete obj.p;
  return res;
};

function promiseAll(promises) {
  const resolves = [];
  let count = 0;
  return new Promise((res, rej) => {
    promises.forEach((promise, index) => {
      promise.then(
        (val) => {
          resolves[index] = val;
          count++;
          if (count == promises.length) {
            res(resolves);
          }
        },
        (reason) => {
          rej(reason);
        }
      );
    });
  });
}

function flatten(arr) {
  return arr.reduce((l, r) => {
    return l.concat(r instanceof Array ? flatten(r) : r);
  }, []);
}

function qianxubianli(root) {
  let res = [];
  function help(root) {
    if (!root) return;
    f(root.left);
    res.push(root.val);
    f(root.right);
  }
  help(root);
  return res;
}
