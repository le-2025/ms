export type Big5Domain = "O" | "C" | "E" | "A" | "N"

export type Big5Item = {
  id: string
  text: string
  keyed: "plus" | "minus"
  domain: Big5Domain
  choices: Array<{ text: string; score: number }>
}

const choices = [
  { text: "非常不符合", score: 0 },
  { text: "不太符合", score: 1 },
  { text: "一般", score: 2 },
  { text: "比较符合", score: 3 },
  { text: "非常符合", score: 4 },
] as const

export function getWorkStyleItems(opts: { version: "short" | "long"; shuffle: boolean }): Big5Item[] {
  const base = opts.version === "long" ? longItems : shortItems
  const items = base.map((it) => ({ ...it, choices: choices.slice() }))
  return opts.shuffle ? shuffleArray(items) : items
}

const shortItems: Array<Omit<Big5Item, "choices">> = [
  { id: "ws_o_01", domain: "O", keyed: "plus", text: "我愿意在工作中尝试新的方法，即使需要先摸索一段时间。" },
  { id: "ws_o_02", domain: "O", keyed: "minus", text: "遇到不熟悉的任务时，我更希望完全照着既有流程来做。" },
  { id: "ws_o_03", domain: "O", keyed: "plus", text: "我喜欢把问题拆成多个角度，寻找更优的解决方案。" },
  { id: "ws_o_04", domain: "O", keyed: "minus", text: "我更偏好稳定不变的工作方式，不太想调整现有做法。" },
  { id: "ws_o_05", domain: "O", keyed: "plus", text: "我愿意主动学习新工具或新知识来提升效率。" },
  { id: "ws_o_06", domain: "O", keyed: "minus", text: "对我来说，按部就班完成任务比探索新思路更重要。" },
  { id: "ws_o_07", domain: "O", keyed: "plus", text: "我能接受不确定性，并在信息不完整时先推动小步试验。" },
  { id: "ws_o_08", domain: "O", keyed: "minus", text: "如果目标还没完全明确，我通常会选择先观望。" },
  { id: "ws_o_09", domain: "O", keyed: "plus", text: "我喜欢在复盘时总结原则和方法，而不只记录结果。" },
  { id: "ws_o_10", domain: "O", keyed: "minus", text: "我不太喜欢讨论“为什么”，更希望直接告诉我怎么做。" },

  { id: "ws_c_01", domain: "C", keyed: "plus", text: "我会把任务拆解成清单，并按优先级推进。" },
  { id: "ws_c_02", domain: "C", keyed: "minus", text: "我经常在最后一刻才集中处理重要任务。" },
  { id: "ws_c_03", domain: "C", keyed: "plus", text: "我习惯提前预估时间和风险，并及时同步给相关人。" },
  { id: "ws_c_04", domain: "C", keyed: "minus", text: "我不太愿意做计划，临场发挥更让我舒服。" },
  { id: "ws_c_05", domain: "C", keyed: "plus", text: "我会认真对齐交付标准，尽量减少返工。" },
  { id: "ws_c_06", domain: "C", keyed: "minus", text: "只要大方向差不多，我不太在意细节是否完全到位。" },
  { id: "ws_c_07", domain: "C", keyed: "plus", text: "我会持续跟进未闭环事项，直到完全结束。" },
  { id: "ws_c_08", domain: "C", keyed: "minus", text: "我有时会忘记前面承诺过的跟进事项。" },
  { id: "ws_c_09", domain: "C", keyed: "plus", text: "我能稳定输出，并在压力下保持节奏。" },
  { id: "ws_c_10", domain: "C", keyed: "minus", text: "当事情变多时，我容易变得杂乱无章。" },

  { id: "ws_e_01", domain: "E", keyed: "plus", text: "我在讨论会上愿意主动表达观点，并推动形成结论。" },
  { id: "ws_e_02", domain: "E", keyed: "minus", text: "在多人讨论中，我通常更愿意保持沉默。" },
  { id: "ws_e_03", domain: "E", keyed: "plus", text: "我更喜欢通过当面/语音快速沟通来推进事情。" },
  { id: "ws_e_04", domain: "E", keyed: "minus", text: "我更喜欢通过文字异步沟通，并自行消化信息。" },
  { id: "ws_e_05", domain: "E", keyed: "plus", text: "我能在对外沟通或跨部门协作中保持能量和耐心。" },
  { id: "ws_e_06", domain: "E", keyed: "minus", text: "频繁的社交和沟通会明显消耗我。" },
  { id: "ws_e_07", domain: "E", keyed: "plus", text: "我愿意在团队里承担“把人拉到一起”的协调角色。" },
  { id: "ws_e_08", domain: "E", keyed: "minus", text: "我更倾向于独立完成任务，尽量减少协同。" },
  { id: "ws_e_09", domain: "E", keyed: "plus", text: "面对冲突或分歧，我能保持直面沟通并推动解决。" },
  { id: "ws_e_10", domain: "E", keyed: "minus", text: "遇到分歧时，我倾向于回避讨论，等情况自然好转。" },

  { id: "ws_a_01", domain: "A", keyed: "plus", text: "我会优先考虑团队协作与整体体验，而不只关注个人任务。" },
  { id: "ws_a_02", domain: "A", keyed: "minus", text: "只要结果能达成，我不太在意过程是否让别人舒服。" },
  { id: "ws_a_03", domain: "A", keyed: "plus", text: "我能站在对方角度理解需求，并调整沟通方式。" },
  { id: "ws_a_04", domain: "A", keyed: "minus", text: "我更习惯用直接方式表达，很少考虑对方感受。" },
  { id: "ws_a_05", domain: "A", keyed: "plus", text: "我愿意给予支持与协助，即使这不是我的本职。" },
  { id: "ws_a_06", domain: "A", keyed: "minus", text: "当别人遇到问题时，我通常认为应当由他自己解决。" },
  { id: "ws_a_07", domain: "A", keyed: "plus", text: "我能够在不冒犯对方的前提下给出建设性反馈。" },
  { id: "ws_a_08", domain: "A", keyed: "minus", text: "我给反馈时往往比较强硬，容易让对方不舒服。" },
  { id: "ws_a_09", domain: "A", keyed: "plus", text: "我更愿意寻找双赢方案，而不是争个输赢。" },
  { id: "ws_a_10", domain: "A", keyed: "minus", text: "在讨论中我更在意谁对谁错，而不是共同推进。" },

  { id: "ws_n_01", domain: "N", keyed: "plus", text: "在紧急情况下，我仍能保持冷静并优先处理关键事项。" },
  { id: "ws_n_02", domain: "N", keyed: "minus", text: "当压力变大时，我容易焦虑并影响发挥。" },
  { id: "ws_n_03", domain: "N", keyed: "plus", text: "遇到批评或否定时，我能快速调整并继续推进工作。" },
  { id: "ws_n_04", domain: "N", keyed: "minus", text: "别人一句负面评价会让我反复纠结很久。" },
  { id: "ws_n_05", domain: "N", keyed: "plus", text: "面对变化和不确定，我能接受并及时调整计划。" },
  { id: "ws_n_06", domain: "N", keyed: "minus", text: "当计划被打乱时，我会明显烦躁或失去动力。" },
  { id: "ws_n_07", domain: "N", keyed: "plus", text: "我能把情绪与工作分开，不轻易迁怒他人。" },
  { id: "ws_n_08", domain: "N", keyed: "minus", text: "情绪波动会影响我与同事的沟通方式。" },
  { id: "ws_n_09", domain: "N", keyed: "plus", text: "我能持续保持信心，把困难当作问题来解决。" },
  { id: "ws_n_10", domain: "N", keyed: "minus", text: "遇到困难时，我容易先否定自己或担心出错。" },
]

const longItems: Array<Omit<Big5Item, "choices">> = [
  ...shortItems,

  { id: "ws_o_11", domain: "O", keyed: "plus", text: "我会主动提出改进建议，并愿意验证它是否有效。" },
  { id: "ws_o_12", domain: "O", keyed: "minus", text: "我更喜欢重复熟悉的工作内容，不太愿意变化。" },
  { id: "ws_o_13", domain: "O", keyed: "plus", text: "我能从行业案例中提炼规律，并迁移到自己的工作里。" },
  { id: "ws_o_14", domain: "O", keyed: "minus", text: "我不太喜欢学习新概念，觉得会分散注意力。" },
  { id: "ws_o_15", domain: "O", keyed: "plus", text: "我喜欢把经验沉淀为文档/模板，便于复用。" },
  { id: "ws_o_16", domain: "O", keyed: "minus", text: "我更愿意按以前的习惯做事，很少总结方法。" },
  { id: "ws_o_17", domain: "O", keyed: "plus", text: "我愿意参与跨领域的任务，并从中学习。" },
  { id: "ws_o_18", domain: "O", keyed: "minus", text: "超出我职责范围的事情，我通常不愿意参与。" },
  { id: "ws_o_19", domain: "O", keyed: "plus", text: "我会把模糊需求变清晰：补信息、设边界、给方案。" },
  { id: "ws_o_20", domain: "O", keyed: "minus", text: "需求不清晰时，我更希望别人给我一个确定答案。" },

  { id: "ws_c_11", domain: "C", keyed: "plus", text: "我习惯在开始前明确验收标准，并对照执行。" },
  { id: "ws_c_12", domain: "C", keyed: "minus", text: "我经常边做边改，最后才考虑怎么验收。" },
  { id: "ws_c_13", domain: "C", keyed: "plus", text: "我会定期整理工作台面/资料/文档，让信息好找。" },
  { id: "ws_c_14", domain: "C", keyed: "minus", text: "我的资料经常散落各处，找东西会花时间。" },
  { id: "ws_c_15", domain: "C", keyed: "plus", text: "我会用数据或记录来证明进展，而不是口头描述。" },
  { id: "ws_c_16", domain: "C", keyed: "minus", text: "我更习惯凭感觉推进，很少记录过程。" },
  { id: "ws_c_17", domain: "C", keyed: "plus", text: "我会尽量把风险提前暴露，避免临近截止才爆雷。" },
  { id: "ws_c_18", domain: "C", keyed: "minus", text: "我不太愿意提前说风险，担心给别人添麻烦。" },
  { id: "ws_c_19", domain: "C", keyed: "plus", text: "我会按约定时间反馈进度，让协作方有预期。" },
  { id: "ws_c_20", domain: "C", keyed: "minus", text: "如果没人追问，我通常不会主动同步进度。" },

  { id: "ws_e_11", domain: "E", keyed: "plus", text: "我愿意主导会议，让讨论更聚焦并产出结论。" },
  { id: "ws_e_12", domain: "E", keyed: "minus", text: "在会议里，我更倾向于听别人讨论，很少发言。" },
  { id: "ws_e_13", domain: "E", keyed: "plus", text: "我能快速建立关系，让合作推进更顺畅。" },
  { id: "ws_e_14", domain: "E", keyed: "minus", text: "我更愿意先把事情做出来，再去沟通解释。" },
  { id: "ws_e_15", domain: "E", keyed: "plus", text: "我可以在不熟悉的人面前自然表达，不太紧张。" },
  { id: "ws_e_16", domain: "E", keyed: "minus", text: "需要对外表达时，我会明显紧张或回避。" },
  { id: "ws_e_17", domain: "E", keyed: "plus", text: "我愿意主动推动跨部门的对齐与协调。" },
  { id: "ws_e_18", domain: "E", keyed: "minus", text: "跨部门协作让我很消耗，我会尽量减少参与。" },
  { id: "ws_e_19", domain: "E", keyed: "plus", text: "我能在高频沟通的工作日保持效率与状态。" },
  { id: "ws_e_20", domain: "E", keyed: "minus", text: "沟通一多我就难以专注，效率明显下降。" },

  { id: "ws_a_11", domain: "A", keyed: "plus", text: "我会在表达不同意见时先确认共同目标，再给建议。" },
  { id: "ws_a_12", domain: "A", keyed: "minus", text: "我表达不同意见时往往比较尖锐，容易让对方不爽。" },
  { id: "ws_a_13", domain: "A", keyed: "plus", text: "我愿意公开认可同事的贡献，而不是把功劳都揽走。" },
  { id: "ws_a_14", domain: "A", keyed: "minus", text: "在成果展示时，我更希望突出自己的贡献。" },
  { id: "ws_a_15", domain: "A", keyed: "plus", text: "我能接受别人用不同方式做事，不强行按我习惯来。" },
  { id: "ws_a_16", domain: "A", keyed: "minus", text: "我对别人的做事方式容忍度不高，容易不耐烦。" },
  { id: "ws_a_17", domain: "A", keyed: "plus", text: "出现误会时，我愿意先澄清事实并给对方台阶。" },
  { id: "ws_a_18", domain: "A", keyed: "minus", text: "出现误会时，我更容易先下结论并坚持己见。" },
  { id: "ws_a_19", domain: "A", keyed: "plus", text: "我愿意主动帮团队补位，确保整体交付。" },
  { id: "ws_a_20", domain: "A", keyed: "minus", text: "只要不是我的任务，我通常不会主动插手。" },

  { id: "ws_n_11", domain: "N", keyed: "plus", text: "面对临时变更，我能迅速调整心态并重排优先级。" },
  { id: "ws_n_12", domain: "N", keyed: "minus", text: "临时变更会让我烦躁，影响我接下来的效率。" },
  { id: "ws_n_13", domain: "N", keyed: "plus", text: "遇到挫折时，我能把注意力放在下一步行动上。" },
  { id: "ws_n_14", domain: "N", keyed: "minus", text: "遇到挫折时，我会反复想“为什么会这样”而难以行动。" },
  { id: "ws_n_15", domain: "N", keyed: "plus", text: "我能在高压期保持基本作息与节奏，不轻易崩盘。" },
  { id: "ws_n_16", domain: "N", keyed: "minus", text: "忙起来我容易失眠或情绪化，影响后续表现。" },
  { id: "ws_n_17", domain: "N", keyed: "plus", text: "我能接受自己会犯小错，并及时修正而不是自责。" },
  { id: "ws_n_18", domain: "N", keyed: "minus", text: "我对犯错非常敏感，容易因此紧张或回避挑战。" },
  { id: "ws_n_19", domain: "N", keyed: "plus", text: "即使被催得很紧，我也能保持礼貌与清晰沟通。" },
  { id: "ws_n_20", domain: "N", keyed: "minus", text: "被频繁催促时，我容易急躁或说话带情绪。" },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

