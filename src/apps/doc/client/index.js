import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { routerReducer } from 'react-router-redux'

//

import clientRouter from './router'
import { ReactApp } from 'super-project/ReactApp'
import { reducer as realtimeLocationReducer, REALTIME_LOCATION_REDUCER_NAME } from './redux/realtime-location'
import { reducerLocaleId as i18nReducerLocaleId, reducerLocales as i18nReducerLocales, register as i18nRegister } from 'sp-i18n'
import { availableLocales } from '@docConfig/i18n'
import { reducer as docsReducer } from './ui/pages/Doc.jsx'
import { onRouterChange } from './ui/layout/Nav.jsx'

const ROUTER_REDUCDER_NAME = 'routing'

const reactApp = new ReactApp({ rootDom: 'root' })

//

reactApp.redux.middleware.use(thunk)
reactApp.redux.middleware.use(routerMiddleware(browserHistory))

// 

reactApp.redux.reducer.use(ROUTER_REDUCDER_NAME, routerReducer) // 路由状态扩展
reactApp.redux.reducer.use(REALTIME_LOCATION_REDUCER_NAME, realtimeLocationReducer) // 目的：新页面请求处理完成后再改变URL
reactApp.redux.reducer.use("localeId", i18nReducerLocaleId)
reactApp.redux.reducer.use("locales", i18nReducerLocales)
reactApp.redux.reducer.use("docs", docsReducer)

// 

let __baidu_tongji_count = 0
reactApp.react.router.use({
    path: '',
    // component: App, 可扩展1层component
    childRoutes: [clientRouter]
})
reactApp.react.router.ext({
    onUpdate: () => {
        if (__DEV__) console.log('react-router onUpdate')

        // 统计代码第一次默认走html引入js
        if (!__DEV__ && __CLIENT__) {
            if (__baidu_tongji_count !== 0) {
                _hmt.push(['_trackPageview', window.location.pathname])
            }

            __baidu_tongji_count++
        }

        /***/ onRouterChange()
    }
})

//

if (__SERVER__) {
    // 载入所有多语言文件
    let locales = {}
    availableLocales.forEach(locale => {
        locales[locale] = require(`@docLocales/${locale}.json`)
    })
    // 服务器端注册多语言
    i18nRegister(availableLocales, locales)
}

if (__CLIENT__) {
    /*const store = */reactApp.run({
        browserHistoryOnUpdate: (location, store) => {
            // 回调: browserHistoryOnUpdate
            // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
            if (__DEV__) console.log('browserHistory update', location)
        }
    })
    // 客户端注册多语言
    i18nRegister(__REDUX_STATE__)
}

export {
    reactApp
}