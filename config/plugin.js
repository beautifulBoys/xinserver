/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  // redis: {
  //   enable: false,
  //   package: 'egg-redis',
  // },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  routerPlus: {
    enable: true,
    package: 'egg-router-plus',
  }
};
