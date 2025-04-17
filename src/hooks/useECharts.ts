import useAppearanceStore from 'stores/useAppearanceStore';
// @ts-ignore
import * as echarts from 'echarts';
import { IChatMessage } from 'intellichat/types';
import { useMemo, useRef } from 'react';

export default function useECharts({ message }: { message: IChatMessage }) {
    const theme = useAppearanceStore((state) => state.theme);
    const messageId = useMemo(() => message.id, [message]);
    const containersRef = useRef([]);

    const disposeECharts = () => {
        const chartInstances = containersRef.current;
        if (chartInstances.length < 1) return;
        chartInstances.forEach(({ cleanup }: { cleanup: Function }) => {
            cleanup();
        });
        chartInstances.length = 0;
    };

    const initECharts = () => {

        // 清理已有实例
        disposeECharts();
        const chartInstances = containersRef.current;

        // 查找所有图表容器
        const containers = document.querySelectorAll(`#${messageId} .echarts-container`);

        containers.forEach(container => {
            const chartId = container.id;
            const encodedConfig = container.getAttribute('data-echarts-config');

            if (!encodedConfig) return;

            try {
                // 解码并解析配置
                const config = decodeURIComponent(encodedConfig);
                const option = new Function(`return ${config}`)();

                // 初始化图表
                // 使用类型断言将 container 转换为 HTMLDivElement 类型，以解决类型不匹配问题
                console.debug("echart container:",container);
                const chart = echarts.init(container as HTMLDivElement, theme);
                chart.setOption(option);

                // 响应式调整
                const resizeHandler = () => chart.resize();
                window.addEventListener('resize', resizeHandler);

                // 保存实例
                chartInstances.push({
                    chartId,
                    instance: chart,
                    cleanup: () => {
                        window.removeEventListener('resize', resizeHandler);
                        chart.dispose();
                    }
                });
            } catch (error: any) {
                console.error('ECharts初始化错误:', error);
                container.innerHTML = `
      <div style="color:red;padding:20px;">
        图表渲染错误: ${error.message}
      </div>
    `;
            }
        });
    };

    return {
        disposeECharts,
        initECharts,
    }
}