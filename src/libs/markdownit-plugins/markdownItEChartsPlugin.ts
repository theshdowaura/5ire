//@ts-ignore
import * as echarts from 'echarts';
//@ts-ignore
import MarkdownIt from 'markdown-it';
//@ts-ignore
import Token from 'markdown-it/lib/token.mjs';



export default function markdownItEChartsPlugin(md: MarkdownIt) {
    window.echarts = echarts; // 将 echarts 暴露到全局作用域中，以便在其他地方使用

    // 默认渲染函数
    const defaultFence = md.renderer.rules.fence || function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: MarkdownIt.Renderer) {
        return self.renderToken(tokens, idx, options);
    };

    // 覆盖fence渲染规则
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const info = token.info.trim();

        // 只处理echarts代码块
        if (info !== 'echarts') {
            return defaultFence(tokens, idx, options, env, self);
        }

        // 生成唯一ID
        const chartId = 'echart-' + Math.random().toString(36).slice(2, 11);
        const code = token.content.trim();

        // 返回带有数据属性的容器
        return `
      <div class="echarts-container" 
           id="${chartId}" 
           data-echarts-config="${encodeURIComponent(code)}" 
           style="width: 400px;height:400px;">
          
      </div>
    `;
    };

    
}