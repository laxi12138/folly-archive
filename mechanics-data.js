window.RUINWRIGHT_MECHANICS = {
  taxonomy: [
    {
      id:'power',
      label:{zh:'动力源',en:'Power',ja:'動力源'},
      children:[
        {
          id:'environment',
          label:{zh:'环境输入',en:'Environmental input',ja:'環境入力'},
          children:[
            {id:'wind',label:{zh:'风动',en:'Wind',ja:'風力'},tag:'wind'},
            {id:'kite',label:{zh:'风筝',en:'Kite',ja:'凧'},tag:'kite'},
            {id:'water',label:{zh:'活水',en:'Flowing water',ja:'流水'},tag:'water'},
            {id:'waterwheel',label:{zh:'水车',en:'Water wheel',ja:'水車'},tag:'waterwheel'},
            {id:'solar',label:{zh:'太阳能',en:'Solar',ja:'太陽光'},tag:'solar'},
            {id:'bio',label:{zh:'生物',en:'Biological',ja:'生物'},tag:'bio'}
          ]
        },
        {
          id:'thermal',
          label:{zh:'热力与燃烧',en:'Heat and combustion',ja:'熱・燃焼'},
          children:[
            {id:'steam',label:{zh:'蒸汽机',en:'Steam',ja:'蒸気機関'},tag:'steam'},
            {id:'combustion',label:{zh:'内燃机',en:'Combustion engine',ja:'内燃機関'},tag:'combustion'},
            {id:'explosion',label:{zh:'爆炸',en:'Explosion',ja:'爆発'},tag:'explosion'}
          ]
        },
        {
          id:'electric-high',
          label:{zh:'电与高能',en:'Electric and high energy',ja:'電気・高エネルギー'},
          children:[
            {id:'electric',label:{zh:'电动',en:'Electric',ja:'電動'},tag:'electric'},
            {id:'nuclear',label:{zh:'核能',en:'Nuclear',ja:'核エネルギー'},tag:'nuclear'}
          ]
        }
      ]
    },
    {
      id:'transmission',
      label:{zh:'传动与耦合',en:'Transmission and coupling',ja:'伝達・結合'},
      children:[
        {
          id:'gear',
          label:{zh:'齿轮与啮合',en:'Gears and meshing',ja:'歯車・噛合'},
          children:[{id:'gugor-gear',label:{zh:'谷戈尔齿轮组',en:'Gugor gear set',ja:'グゴル歯車群'},tag:'gugor-gear'}]
        },
        {
          id:'stress-coupling',
          label:{zh:'张拉与应力',en:'Tension and stress',ja:'張力・応力'},
          children:[{id:'stress',label:{zh:'应力',en:'Stress',ja:'応力'},tag:'stress'}]
        }
      ]
    },
    {
      id:'storage-release',
      label:{zh:'储能与释放',en:'Storage and release',ja:'蓄積・放出'},
      children:[
        {id:'flywheel-storage',label:{zh:'飞轮储能',en:'Flywheel storage',ja:'フライホイール蓄積'},tag:'flywheel'},
        {id:'elastic-stress',label:{zh:'弹性应力',en:'Elastic stress',ja:'弾性応力'},tag:'stress'},
        {id:'pressure',label:{zh:'压力',en:'Pressure',ja:'圧力'},tag:'pressure'},
        {id:'explosive-release',label:{zh:'爆发释放',en:'Burst release',ja:'瞬間放出'},tag:'explosion'}
      ]
    },
    {
      id:'rotation',
      label:{zh:'旋转与惯性',en:'Rotation and inertia',ja:'回転・慣性'},
      children:[
        {id:'flywheel',label:{zh:'飞轮',en:'Flywheel',ja:'フライホイール'},tag:'flywheel'},
        {id:'gyroscope',label:{zh:'陀螺仪',en:'Gyroscope',ja:'ジャイロスコープ'},tag:'gyroscope'},
        {id:'centrifuge',label:{zh:'离心机',en:'Centrifuge',ja:'遠心機'},tag:'centrifuge'}
      ]
    },
    {
      id:'material-process',
      label:{zh:'材料与过程实验',en:'Material and process studies',ja:'材料・過程実験'},
      children:[
        {id:'asphalt',label:{zh:'沥青实验',en:'Asphalt study',ja:'アスファルト実験'},tag:'asphalt'},
        {id:'bio-material',label:{zh:'生物材料',en:'Biomaterial',ja:'生体材料'},tag:'bio'}
      ]
    }
  ],

  tagLabels:{
    wind:{zh:'风动',en:'Wind',ja:'風力'},
    kite:{zh:'风筝',en:'Kite',ja:'凧'},
    water:{zh:'活水',en:'Water',ja:'流水'},
    waterwheel:{zh:'水车',en:'Water wheel',ja:'水車'},
    solar:{zh:'太阳能',en:'Solar',ja:'太陽光'},
    bio:{zh:'生物',en:'Biological',ja:'生物'},
    steam:{zh:'蒸汽机',en:'Steam',ja:'蒸気'},
    combustion:{zh:'内燃机',en:'Combustion',ja:'内燃'},
    explosion:{zh:'爆炸',en:'Explosion',ja:'爆発'},
    electric:{zh:'电动',en:'Electric',ja:'電動'},
    nuclear:{zh:'核能',en:'Nuclear',ja:'核'},
    'gugor-gear':{zh:'谷戈尔齿轮组',en:'Gugor gear set',ja:'グゴル歯車群'},
    stress:{zh:'应力',en:'Stress',ja:'応力'},
    pressure:{zh:'压力',en:'Pressure',ja:'圧力'},
    flywheel:{zh:'飞轮',en:'Flywheel',ja:'フライホイール'},
    gyroscope:{zh:'陀螺仪',en:'Gyroscope',ja:'ジャイロ'},
    centrifuge:{zh:'离心机',en:'Centrifuge',ja:'遠心機'},
    asphalt:{zh:'沥青实验',en:'Asphalt',ja:'アスファルト'}
  },

  records:[
    {code:'M-001',title:{zh:'风动－张拉－飞轮',en:'Wind — tension — flywheel',ja:'風力－張力－フライホイール'},tags:['wind','stress','flywheel'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-002',title:{zh:'活水－水车－储能',en:'Water — wheel — storage',ja:'流水－水車－蓄積'},tags:['water','waterwheel','flywheel'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-003',title:{zh:'太阳能－电动－陀螺仪',en:'Solar — electric — gyroscope',ja:'太陽光－電動－ジャイロ'},tags:['solar','electric','gyroscope'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-004',title:{zh:'内燃机－飞轮',en:'Combustion — flywheel',ja:'内燃機関－フライホイール'},tags:['combustion','flywheel'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-005',title:{zh:'蒸汽机－压力－释放',en:'Steam — pressure — release',ja:'蒸気－圧力－放出'},tags:['steam','pressure','explosion'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-006',title:{zh:'核能－电动－储能',en:'Nuclear — electric — storage',ja:'核－電動－蓄積'},tags:['nuclear','electric','flywheel'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-007',title:{zh:'生物－应力',en:'Biological — stress',ja:'生物－応力'},tags:['bio','stress'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-008',title:{zh:'沥青－应力实验',en:'Asphalt — stress study',ja:'アスファルト－応力実験'},tags:['asphalt','stress'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-009',title:{zh:'谷戈尔齿轮组－飞轮',en:'Gugor gear set — flywheel',ja:'グゴル歯車群－フライホイール'},tags:['gugor-gear','flywheel'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-010',title:{zh:'风筝－风动－张拉',en:'Kite — wind — tension',ja:'凧－風力－張力'},tags:['kite','wind','stress'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-011',title:{zh:'离心机－电动',en:'Centrifuge — electric',ja:'遠心機－電動'},tags:['centrifuge','electric'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}},
    {code:'M-012',title:{zh:'爆炸－压力',en:'Explosion — pressure',ja:'爆発－圧力'},tags:['explosion','pressure'],image:null,note:{zh:'示例档案。',en:'Sample record.',ja:'サンプル記録。'}}
  ]
};