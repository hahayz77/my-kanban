import React from "react"
import { Draggable } from "@hello-pangea/dnd"
import { AlignLeft, CheckSquare, Calendar } from "lucide-react"
import { getTrelloColor } from "../utils/trelloColors"
import { TrelloPatternIcon, TrelloPatternStrip } from "./TrelloPatternIcon"
import { renderCardSticker } from "../utils/trelloStickers"

/**
 * CardItem component represents a Kanban card supporting all 3 Trello cover modes,
 * authentic full-height edge patterns for colored covers, compact stickers, and natural adaptive heights
 * @param {Object} props - Component properties
 * @param {Object} props.card - The card data object
 * @param {number} props.index - Draggable index position
 * @param {string} [props.cardDensity="compact"] - Density preset ("ultra-compact"|"compact"|"normal"|"comfortable")
 * @param {Function} props.onOpen - Callback triggered when the card is clicked to edit
 * @returns {JSX.Element} Rendered card component
 */
export const CardItem = ({
  card,
  index,
  cardDensity = "compact",
  onOpen
}) => {
  const totalCheckItems = (card.checklists || []).reduce(
    (acc, checklist) => acc + (checklist.checkItems || []).length,
    0
  )

  const completedCheckItems = (card.checklists || []).reduce(
    (acc, checklist) =>
      acc +
      (checklist.checkItems || []).filter((item) => item.state === "complete")
        .length,
    0
  )

  /**
   * Formats ISO due date string into local short date
   * @param {string} dateString - ISO string
   * @returns {string} Formatted short date
   */
  const formatDueDate = (dateString) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    } catch {
      return dateString
    }
  }

  const isOverdue =
    card.due && !card.dueComplete && new Date(card.due).getTime() < Date.now()

  const coverColorObj = card.cover?.color ? getTrelloColor(card.cover.color) : null
  const isFullCover = coverColorObj && card.cover?.size === "full"
  const hasSticker = Boolean(card.sticker)

  // Density-specific style mapping (Compact is the system default)
  const densityStyles = {
    "ultra-compact": {
      wrapper: "mb-1 rounded",
      stripWidth: "w-3.5",
      contentPl: "pl-5",
      coverHeader: "h-[14px]",
      stickerSize: "w-9 h-8",
      stickerCardMinHeight: "min-h-[64px]",
      body: "px-2 py-1",
      labelsGap: "gap-0.5 mb-0.5",
      labelPill: "px-1 py-0 text-[8.5px] max-w-[140px]",
      labelIcon: "w-2 h-2",
      title: "text-[10.5px] leading-tight line-clamp-2 text-left",
      fullTitle: "text-[10.5px] font-bold leading-tight line-clamp-2 text-left tracking-normal",
      footer: "mt-1 pt-0.5 text-[9px]",
      badgeIcon: "w-2.5 h-2.5",
      badgeText: "text-[8.5px]"
    },
    compact: {
      wrapper: "mb-1 rounded-md",
      stripWidth: "w-3.5",
      contentPl: "pl-6",
      coverHeader: "h-[18px]",
      stickerSize: "w-11 h-9.5",
      stickerCardMinHeight: "min-h-[74px]",
      body: "px-2.5 py-1.5",
      labelsGap: "gap-1 mb-1",
      labelPill: "px-1.5 py-0.2 text-[9.5px] max-w-[170px]",
      labelIcon: "w-2.5 h-2.5",
      title: "text-[11.5px] leading-tight line-clamp-3 text-left",
      fullTitle: "text-[11.5px] font-bold leading-tight line-clamp-3 text-left tracking-normal",
      footer: "mt-1.5 pt-0.5 text-[10px]",
      badgeIcon: "w-2.5 h-2.5",
      badgeText: "text-[9px]"
    },
    normal: {
      wrapper: "mb-1.5 rounded-lg",
      stripWidth: "w-3.5",
      contentPl: "pl-6",
      coverHeader: "h-[22px]",
      stickerSize: "w-12 h-10.5",
      stickerCardMinHeight: "min-h-[82px]",
      body: "p-2.5",
      labelsGap: "gap-1 mb-1.5",
      labelPill: "px-1.5 py-0.5 text-[10px] max-w-[200px]",
      labelIcon: "w-2.5 h-2.5",
      title: "text-xs leading-snug line-clamp-3 text-left",
      fullTitle: "text-xs font-bold leading-snug line-clamp-3 text-left tracking-normal",
      footer: "mt-2 pt-1 text-[11px]",
      badgeIcon: "w-3 h-3",
      badgeText: "text-[10px]"
    },
    comfortable: {
      wrapper: "mb-2 rounded-xl",
      stripWidth: "w-3.5",
      contentPl: "pl-7",
      coverHeader: "h-[26px]",
      stickerSize: "w-13 h-11.5",
      stickerCardMinHeight: "min-h-[92px]",
      body: "p-3",
      labelsGap: "gap-1.5 mb-2",
      labelPill: "px-2 py-0.5 text-xs font-semibold max-w-[220px]",
      labelIcon: "w-3 h-3",
      title: "text-sm font-medium leading-normal line-clamp-4 text-left",
      fullTitle: "text-sm font-bold leading-normal line-clamp-4 text-left tracking-normal",
      footer: "mt-2.5 pt-1.5 text-xs",
      badgeIcon: "w-3.5 h-3.5",
      badgeText: "text-xs"
    }
  }

  const ds = densityStyles[cardDensity] || densityStyles.compact

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => {
        // CASE 1: COR EM TODO O CARTÃO (100% FULL COVER)
        // Full cover cards NEVER show description or checklist details!
        if (isFullCover) {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => onOpen(card)}
              style={{
                ...provided.draggableProps.style,
                backgroundColor: coverColorObj.bg,
                color: coverColorObj.text,
                borderColor: coverColorObj.border
              }}
              className={`group relative border text-left transition-all cursor-pointer select-none overflow-hidden shadow-sm ${
                ds.wrapper
              } ${
                hasSticker ? ds.stickerCardMinHeight : ""
              } ${
                snapshot.isDragging
                  ? "ring-2 ring-white/60 scale-[1.01] z-50 shadow-xl"
                  : "hover:shadow-md hover:brightness-105"
              }`}
            >
              {/* Absolute Left Pattern Strip: perfectly follows card height without inflating it */}
              <div
                className={`absolute inset-y-0 left-0 border-r border-black/15 bg-black/15 text-white/80 overflow-hidden pointer-events-none ${ds.stripWidth}`}
              >
                <TrelloPatternStrip
                  color={card.cover.color}
                  className="w-full h-full block"
                />
              </div>

              {/* Card Content in Full Color */}
              <div
                className={`relative ${ds.contentPl} pr-2.5 py-1.5 flex flex-col justify-between h-full min-w-0`}
              >
                {hasSticker ? (
                  <>
                    {/* Compact rotated sticker near top edge */}
                    <div className="pt-0.5 flex justify-center items-start">
                      {renderCardSticker(
                        card.sticker,
                        `${ds.stickerSize} transform -rotate-6 hover:rotate-0 transition-transform duration-200`
                      )}
                    </div>

                    {/* Card Title left-aligned at bottom */}
                    <h4
                      className={`mt-auto pt-1 tracking-tight text-left font-bold ${ds.fullTitle}`}
                      style={{ color: coverColorObj.text }}
                    >
                      {card.title}
                    </h4>
                  </>
                ) : (
                  /* Plain Full Cover: Just title at left, compact (~32px), NO details shown */
                  <div className="flex items-center min-h-[22px]">
                    <h4
                      className={`tracking-tight text-left font-bold ${ds.fullTitle}`}
                      style={{ color: coverColorObj.text }}
                    >
                      {card.title}
                    </h4>
                  </div>
                )}
              </div>
            </div>
          )
        }

        // CASE 2: FAIXA COLORIDA NO TOPO (HEADER COVER)
        // Shows slim colored banner with edge pattern on top, dark body below with tags/details
        if (coverColorObj) {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => onOpen(card)}
              className={`group relative border text-left bg-slate-800/95 hover:bg-slate-750 transition-all cursor-pointer select-none overflow-hidden shadow-sm border-slate-700/70 hover:border-slate-600 ${
                ds.wrapper
              } ${
                hasSticker ? ds.stickerCardMinHeight : ""
              } ${
                snapshot.isDragging
                  ? "border-indigo-500 shadow-xl ring-2 ring-indigo-500/40 bg-slate-800 scale-[1.01] z-50"
                  : ""
              }`}
            >
              {/* Colored Top Header Banner (Faixa Colorida) */}
              <div
                className={`relative w-full overflow-hidden transition-colors ${ds.coverHeader}`}
                style={{ backgroundColor: coverColorObj.bg }}
              >
                {/* Lateral Pattern Strip: touches left, top and bottom edge with 0 padding */}
                <div
                  className={`absolute inset-y-0 left-0 border-r border-black/15 bg-black/15 text-white/85 overflow-hidden pointer-events-none ${ds.stripWidth}`}
                >
                  <TrelloPatternStrip
                    color={card.cover.color}
                    className="w-full h-full block"
                  />
                </div>
              </div>

              {/* Card Body below the colored banner */}
              <div
                className={`flex flex-col justify-between ${ds.body}`}
              >
                {hasSticker ? (
                  <>
                    <div className="pt-0.5 flex justify-center items-start">
                      {renderCardSticker(
                        card.sticker,
                        `${ds.stickerSize} transform -rotate-6 hover:rotate-0 transition-transform duration-200`
                      )}
                    </div>
                    <h4
                      className={`mt-auto pt-1 text-slate-100 group-hover:text-indigo-200 transition-colors ${ds.title}`}
                    >
                      {card.title}
                    </h4>
                  </>
                ) : (
                  <>
                    {/* Labels with Trello Pattern Icon on the Left */}
                    {card.labels && card.labels.length > 0 && (
                      <div className={`flex flex-wrap ${ds.labelsGap}`}>
                        {card.labels.map((label) => {
                          const labelColor = getTrelloColor(label.color)
                          return (
                            <span
                              key={label.id || label.name}
                              style={{
                                backgroundColor: labelColor.bg,
                                color: labelColor.text
                              }}
                              className={`inline-flex items-center gap-1 font-medium rounded shadow-sm leading-tight truncate ${ds.labelPill}`}
                            >
                              <TrelloPatternIcon
                                color={label.color}
                                className={`${ds.labelIcon} flex-shrink-0 opacity-80`}
                              />
                              <span className="truncate">
                                {label.name || "•"}
                              </span>
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Left-aligned Title */}
                    <h4
                      className={`text-slate-100 group-hover:text-indigo-200 transition-colors ${ds.title}`}
                    >
                      {card.title}
                    </h4>

                    {/* Badges Footer (only shown if at least one badge is present) */}
                    {(card.desc || totalCheckItems > 0 || card.due) && (
                      <div
                        className={`flex items-center gap-2 text-slate-400 ${ds.footer}`}
                      >
                        {(card.desc || card.pendingDesc) && (
                          <div
                            className="flex items-center gap-0.5 hover:text-slate-200"
                            title={card.hasPendingChanges ? "Possui alterações pendentes de confirmação" : "Possui descrição"}
                          >
                            <AlignLeft className={ds.badgeIcon} />
                          </div>
                        )}

                        {card.hasPendingChanges && (
                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40"
                            title="Cartão com alterações pendentes de aprovação"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Pendente</span>
                          </div>
                        )}

                        {totalCheckItems > 0 && (
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              completedCheckItems === totalCheckItems
                                ? "text-emerald-400"
                                : "text-slate-400"
                            }`}
                            title={`Checklist: ${completedCheckItems}/${totalCheckItems}`}
                          >
                            <CheckSquare className={ds.badgeIcon} />
                            <span className={ds.badgeText}>
                              {completedCheckItems}/{totalCheckItems}
                            </span>
                          </div>
                        )}

                        {card.due && (
                          <div
                            className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
                              ds.badgeText
                            } ${
                              card.dueComplete
                                ? "bg-emerald-500/20 text-emerald-300"
                                : isOverdue
                                ? "bg-rose-500/20 text-rose-300 font-semibold"
                                : "bg-slate-700/80 text-slate-300"
                            }`}
                            title={card.due}
                          >
                            <Calendar className={ds.badgeIcon} />
                            <span>{formatDueDate(card.due)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        }

        // CASE 3: CARTÃO SEM COR (COLORLESS / DEFAULT DARK CARD)
        // NO lateral strip! Small and compact, displays only text if no tags or badges exist
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onOpen(card)}
            className={`group relative border text-left bg-slate-800/95 hover:bg-slate-750 transition-all cursor-pointer select-none overflow-hidden shadow-sm border-slate-700/70 hover:border-slate-600 ${
              ds.wrapper
            } ${
              hasSticker ? ds.stickerCardMinHeight : ""
            } ${
              snapshot.isDragging
                ? "border-indigo-500 shadow-xl ring-2 ring-indigo-500/40 bg-slate-800 scale-[1.01] z-50"
                : ""
            }`}
          >
            <div className={`flex flex-col justify-between ${ds.body}`}>
              {hasSticker ? (
                <>
                  <div className="pt-0.5 flex justify-center items-start">
                    {renderCardSticker(
                      card.sticker,
                      `${ds.stickerSize} transform -rotate-6 hover:rotate-0 transition-transform duration-200`
                    )}
                  </div>
                  <h4
                    className={`mt-auto pt-1 text-slate-100 group-hover:text-indigo-200 transition-colors ${ds.title}`}
                  >
                    {card.title}
                  </h4>
                </>
              ) : (
                <>
                  {/* Labels if any */}
                  {card.labels && card.labels.length > 0 && (
                    <div className={`flex flex-wrap ${ds.labelsGap}`}>
                      {card.labels.map((label) => {
                        const labelColor = getTrelloColor(label.color)
                        return (
                          <span
                            key={label.id || label.name}
                            style={{
                              backgroundColor: labelColor.bg,
                              color: labelColor.text
                            }}
                            className={`inline-flex items-center gap-1 font-medium rounded shadow-sm leading-tight truncate ${ds.labelPill}`}
                          >
                            <TrelloPatternIcon
                              color={label.color}
                              className={`${ds.labelIcon} flex-shrink-0 opacity-80`}
                            />
                            <span className="truncate">
                              {label.name || "•"}
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Left-aligned Title (super compact if only text) */}
                  <h4
                    className={`text-slate-100 group-hover:text-indigo-200 transition-colors ${ds.title}`}
                  >
                    {card.title}
                  </h4>

                  {/* Badges Footer (only shown if at least one badge is present) */}
                  {(card.desc || totalCheckItems > 0 || card.due) && (
                    <div
                      className={`flex items-center gap-2 text-slate-400 ${ds.footer}`}
                    >
                      {(card.desc || card.pendingDesc) && (
                        <div
                          className="flex items-center gap-0.5 hover:text-slate-200"
                          title={card.hasPendingChanges ? "Possui alterações pendentes de confirmação" : "Possui descrição"}
                        >
                          <AlignLeft className={ds.badgeIcon} />
                        </div>
                      )}

                      {card.hasPendingChanges && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40"
                          title="Cartão com alterações pendentes de aprovação"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Pendente</span>
                        </div>
                      )}

                      {totalCheckItems > 0 && (
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            completedCheckItems === totalCheckItems
                              ? "text-emerald-400"
                              : "text-slate-400"
                          }`}
                          title={`Checklist: ${completedCheckItems}/${totalCheckItems}`}
                        >
                          <CheckSquare className={ds.badgeIcon} />
                          <span className={ds.badgeText}>
                            {completedCheckItems}/{totalCheckItems}
                          </span>
                        </div>
                      )}

                      {card.due && (
                        <div
                          className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
                            ds.badgeText
                          } ${
                            card.dueComplete
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isOverdue
                              ? "bg-rose-500/20 text-rose-300 font-semibold"
                              : "bg-slate-700/80 text-slate-300"
                          }`}
                          title={card.due}
                        >
                          <Calendar className={ds.badgeIcon} />
                          <span>{formatDueDate(card.due)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      }}
    </Draggable>
  )
}
