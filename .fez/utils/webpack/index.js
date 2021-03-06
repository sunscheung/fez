/**
 * =================================
 * @2017-2018 FEZ前端模块化工程开发框架
 * https://github.com/furic-zhao/fez
 * =================================
 */

/**
 * 处理多文件
 * https://github.com/isaacs/node-glob
 */
import glob from 'glob'

/**
 * 命令行日志
 * https://www.npmjs.com/package/fancy-log
 */
import fancyLog from 'fancy-log'

/**
 * 命令行颜色
 */
import chalk from 'chalk'

/**
 * Nodejs处理路径
 * http://nodejs.cn/api/path.html
 */
import path from 'path'

/**
 * 引入webpack
 */
import webpack from 'webpack'

/**
 * 合并webpack配置
 */
import merge from 'webpack-merge'

/**
 * 引入 fez.config.js 配置
 */
import config from '../fezconfig'

/**
 * 输出路径
 */
import outputPath from './output-path'

export default {
  /**
   * 研发任务
   * @param  cb            [gulp cb]
   * @param  reloadHandler [browserSync reload]
   */
  dev(cb, reloadHandler) {
    process.env.NODE_ENV = 'development'

    let webpackConfig = merge(config.webpack.config, require('./config.base').default, require('./config.dev').default)

    glob(path.join(process.cwd(), config.paths.src.appJs, '*/index.js'), (error, files) => {

      //获取所有JS入口
      files.map((file) => {
        const source_name = path.dirname(file).split(path.sep).pop()
        webpackConfig.entry[outputPath.js(source_name)] = file
      })

      // console.log(JSON.stringify(webpackConfig))
      webpack(webpackConfig, function(err, stats) {
        //致命的 wepback 错误（配置出错等）
        if (err) throw err

        //编译错误（缺失的 module，语法错误等）
        // const info = stats.toJson()
        // info.errors 错误详情
        if (stats.hasErrors()) {
          fancyLog.error(chalk.red('语法错误、或缺失module'))
        }

        // //编译告警
        // if (stats.hasWarnings()) {
        //   fancyLog.warn(info.warnings)
        // }

        reloadHandler()

        cb()
      })
    })
  },

  /**
   * 生产任务
   * @param  {Function} cb [gulp cb]
   */
  dist(cb) {
    process.env.NODE_ENV = 'production'

    let webpackConfig = merge(config.webpack.config, require('./config.base').default, require('./config.dist').default)

    /**
     * 合并自定义vendor脚本
     */
    for (let item of config.webpack.extract.js) {
      webpackConfig.optimization.splitChunks.cacheGroups[`vendor-webpack-${item.target}`] = {
        name: path.join(outputPath.js(), `vendor-webpack-${item.target}`),
        chunks: 'all',
        test: function(module) {
          return (
            module.resource &&
            new RegExp(`node_modules\/(${item.chunk.join('|')})\/(.*)\.js$`).test(module.resource)
          );
        }
      }
    }

    glob(path.join(process.cwd(), config.paths.src.appJs, '*/index.js'), (error, files) => {

      // let appChunks = []
      //获取所有js入口
      files.map((file) => {
        const source_name = path.dirname(file).split(path.sep).pop()
        webpackConfig.entry[outputPath.js(source_name)] = file

        // appChunks.push(outputPath.js(source_name))
      })

      //提取合并公共脚本
      // for (let item of config.webpack.extract.js) {
      //   webpackConfig.entry[outputPath.js(`vendor-${item.target}`)] = item.chunk
      //   webpackConfig.plugins = webpackConfig.plugins.concat(
      //     new webpack.optimize.CommonsChunkPlugin({
      //       name: outputPath.js(`vendor-${item.target}`),
      //       chunks: [...appChunks, ...[outputPath.js(`vendor-${item.target}`)]],
      //       minChunks: function(module) {
      //         // This prevents stylesheet resources with the .css or .scss extension
      //         // from being moved from their original chunk to the vendor chunk
      //         if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
      //           return false
      //         }
      //         return module.context && module.context.includes("node_modules")
      //       }
      //     })
      //   )
      // }

      //生成manifest
      // webpackConfig.plugins = webpackConfig.plugins.concat(
      //   new webpack.optimize.CommonsChunkPlugin({
      //     name: outputPath.js('manifest'),
      //     minChunks: Infinity
      //   })
      // )

      // console.log(JSON.stringify(webpackConfig))
      webpack(webpackConfig, function(err, stats) {
        //致命的 wepback 错误（配置出错等）
        if (err) throw err

        //编译错误（缺失的 module，语法错误等）
        // const info = stats.toJson()
        // info.errors 错误详情
        if (stats.hasErrors()) {
          fancyLog.error(chalk.red('语法错误、或缺失module'))
        }

        // //编译告警
        // if (stats.hasWarnings()) {
        //   fancyLog.warn(info.warnings)
        // }

        cb()
      })
    })
  }
}

/**
 * 《玉龙雪山》
 * 于2014年10月 云南大理
 * -------------------
 * 玉峰皎洁峦碧翠
 * 龙跃起舞云霞蔚
 * 雪映秋色蓝月谷
 * 山环帅气向妩媚
 */
