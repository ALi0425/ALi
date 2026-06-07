

# **📑 产品需求文档 (PRD)：李晶晶 AI 资产控制台 (V5.0 源码级复刻版)**

## **🎨 1\. 视觉设计系统与 UI 令牌 (Ouahdina Code-Matched System)**

请严格使用以下从目标网站源码中提取的 Tailwind 类名与材质令牌，绝不允许 AI 自由发挥。

### **1.1 色彩与环境纹理 (Environment Tokens)**

* **Canvas Base (画布基底)：** 全站背景严格锁死为 \#050505（纯粹矩阵极黑） 。  
* **Grid Base (物理网格背景)：** 必须在底层常驻以下源码对应的 4rem 物理网格与反向遮罩 ：  
  HTML  
  \<div class\="absolute inset-0 bg-\[linear-gradient(to\_right,\#1a1a1a\_1px,transparent\_1px),linear-gradient(to\_bottom,\#1a1a1a\_1px,transparent\_1px)\] bg-\[size:4rem\_4rem\] \[mask-image:radial-gradient(ellipse\_60%\_50%\_at\_50%\_0%,\#000\_70%,transparent\_100%)\] pointer-events-none"\>\</div\>

* **Scanlines (CRT 电子扫描线纹理)：** 叠加不透明度为 20% 的微弱电子流纹理 ：  
  HTML  
  \<div class\="absolute inset-0 bg-\[linear-gradient(rgba(18,16,16,0)\_50%,rgba(0,0,0,0.1)\_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))\] z-0 bg-\[length:100%\_2px,3px\_100%\] pointer-events-none opacity-20"\>\</div\>

* **Card Background (卡片材质)：** 统一采用 bg-neutral-950/40 backdrop-blur-sm border border-neutral-800/60 。  
* **Hover Glow (鼠标动态发光)：** 所有的卡片和浮动节点在鼠标滑过时，触发以下源码级的径向走光效果 ：  
  CSS  
  background: radial-gradient(650px at var(--x) var(--y), rgba(34, 197, 94, 0.15), transparent 80%);

### **1.2 排版与状态标签 (Typography & Badge Tokens)**

* **Display Title (主标题)：** 极致大字号与紧凑字距：font-display text-6xl sm:text-8xl tracking-tighter text-white font-bold 。  
* **System Badge (系统指示标签)：** 严格复刻源码中的绿色状态指示灯 ：  
  HTML  
  \<div class\="inline-flex items-center gap-3 px-4 py-2 border border-green-500/30 bg-green-500/5 rounded-sm text-green-400 font-mono text-xs tracking-widest"\>  
    \<span class\="relative flex h-2 w-2"\>  
      \<span class\="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"\>\</span\>  
      \<span class\="relative inline-flex rounded-full h-2 w-2 bg-green-500"\>\</span\>  
    \</span\>  
    SYSTEM\_STATUS: AUTHORIZED\_BY\_JJ  
  \</div\>

## **💾 2\. 节点资产与个人信息建模 (Data Asset Mapping)**

所有的个人资历与项目经历被物化为**吸附在 3D 自转球体上的温润白瓷感晶体卡片**：

* **Node\_Core（个人母核）：** 李晶晶 (Li Jingjing) 。Hover 弹出代码风气泡：\[4年B端交付专家\]、\[27岁/北京\] 。点击展开隐藏机密档案：华北理工大学专业前15%、发表学术论文 4 篇 、玛氏/欧莱雅商赛全国前列 。  
* **Node\_A1（AI 项目）：** OmniSight 策略导航 。能力气泡：\[n8n工作流自动化\]、\[GraphRAG双库分流\]、\[JSON Mode提取\] 。  
* **Node\_A2（AI 项目）：** RARE 智能逆向平台 。能力气泡：\[元数据逆向解析\]、\[嵌套交互画布\]、\[强Schema校验\] 。  
* **Node\_B1（传统 B端）：** 科技管理系统一/二期 。能力气泡：\[20+业务流程拆解\] 、\[纳管12805项成果\] 、\[效率提升60%+\] 。  
* **Node\_B2（传统 B端）：** 科技管理应用（三期） 。能力气泡：\[万级数据高效协同\] 、\[14家二级单位协同\] 。  
* **Node\_Doc（过程材料）：** 大厂正规军交付物 。能力气泡：\[技术规范书\] 、\[可行性研究报告\] 、\[需规说明书\] 。

## **🧭 3\. 四阶段核心交互状态机 (The Kinetic Journey)**

### **🪐 阶段一：初始入场 · 呼吸旋转的 3D 终端粒子球 (State 01\)**

* **UI 渲染：** 在 \#050505 的矩阵极黑背景中央 ，通过 Three.js 渲染一个由 1200 个散发着绿色微光（rgba(34, 197, 94, 0.6)）的粒子与白瓷半透实体组成的 3D 自转球体。  
* **节点吸附：** 上述 6 个核心水晶球节点作为润泽的白玉色实体，**直接吸附在 3D 球体的表面，跟随球体做慢速、优雅的自转**。  
* **物理微动效：** 球体支持手机陀螺仪/鼠标位置轻微晃动位移，呈现平滑延时的物理呼吸感。  
* **系统自述：** 粒子球周围环绕着极细的网格线，动态打印着你的基本信息流 ：  
  * \<span\>CURIOSITY: 100%\</span\> | \<span\>TEAMWORK: ACTIVE\</span\>  
* **引导提示：** 顶部状态栏闪烁：“请开启摄像头并张开手掌，或双击鼠标，解构 KERNEL\_MODULES”。

### **💥 阶段二：手势触发 · 资产颗粒流的大爆炸 (State 02\)**

* **触发条件：** MediaPipe Hands 检测到手掌从握拳到完全张开（大拇指小拇指跨度超标），或用户执行鼠标双击。  
* **动效表现：** 1\. **流体炸开：** 3D 球体粒子瞬间呈 cubic-bezier(0.1, 1, 0.1, 1)（超平滑缓动减速）向四周爆炸发散。 2\. **网格吸附：** 炸开的粒子最终精准减速，**完美吸附对齐停留在背景的** 4rem\_4rem **网格线交汇处（Intersection Points）** ，化作全站背景上一个个亮起的极小绿色坐标原点。 3\. **优雅悬浮：** 表面的 6 个核心卡片节点摆脱引力，平滑飘散在空中，以流体排斥算法错落悬浮，做幅度为上下 5px 的轻微慢速漂浮动画，永不重叠。

### **🎈 阶段三：吹泡泡 Hover 与终端源码面板坠落 (State 03\)**

* **Hover 微交互：** 鼠标滑过任何一个大项目节点。节点表面泛起一层微弱的虹彩。周围像吹泡泡一样，依次“功能性淡入”弹出 3 个半透明终端风的能力小气泡。  
* **Click 交互（源码级面板慢降）：** 点击任何项目节点，网页其余部分优雅淡出。**一个原汁原味复刻你提供代码中关于** \~/profile/about\_me.tsx **结构的 macOS 编译终端面板，从屏幕最上方平滑拉下（Top-down Layout）** 。  
  HTML  
  \<div class\="relative bg-\[\#1e1e1e\]/90 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl"\>  
    \<div class\="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2"\>  
      \<div class\="w-3 h-3 rounded-full bg-red-500/80"\>\</div\>  
      \<div class\="w-3 h-3 rounded-full bg-yellow-500/80"\>\</div\>  
      \<div class\="w-3 h-3 rounded-full bg-green-500/80"\>\</div\>  
      \<div class\="ml-4 text-\[10px\] font-mono text-neutral-500"\>\~/profile/rare\_architecture.tsx\</div\>  
    \</div\>  
    \</div\>

### **🔗 阶段四：流光连线与 Safari 视窗内的 Canvas Diff 仿真沙盒 (State 04\)**

* **连线操作：** 面试官可以从任意一个传统项目节点拉出一动带有重力挂靠感的**矩阵绿色流光线条**，吸附扣合至 AI 节点（如 【Node\_B1】 $\\rightarrow$ 【Node\_A2: RARE】）。  
* **乱连校验（Schema 拦截）：** 乱连时（如学术论文强连逆向平台），线条无法扣合，瞬间触发**高热熔断橘色（\#FF5500）的电流过载崩散效果**，线条像微尘一样蒸发，控制台输出：\[Schema Error\]: Matrix Mismatch。  
* **有效连通反馈与苹果 Safari 浏览器降落：** 当满足有效连通时，连线通电亮起，无数光粒瀑布快流。背景淡出，屏幕正中央垂直慢速坠落一个**原生的、带有全透明组件效果的“苹果 Safari 浏览器视窗 Mockup”** ：  
  * *浏览器 UI：* 左上角带有一排精致的苹果红黄绿交通灯微型圆点 ，中心带有半透明地址栏，显示：rare.lijingjing.ai/canvas\_diff\_sandbox。  
  * *Canvas Diff 苹果式染色操作：* 面试官在浏览器左栏选择“14家二级单位协同冲突” 。右栏画布的元数据拓扑树开始平滑推演。新需求切入时，受冲击的菜单、服务、权限节点 ，**严格以苹果 Git Diff 规范的“果味浅红（\#EF4444/20）/淡绿（\#22C55E/20）”进行平滑的染色块预警与惯性回弹（Canvas Diff）** 。  
  * *0 Token 安全防线：* 全程基于前端 Mock 数据包运行，大模型实际 Token 消耗为 0，右下角紫光按钮可解锁真实算力测试，并强前置 IP 针对单次输入 30 字、24小时限流 2 次的熔断拦截。

