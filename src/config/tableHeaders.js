export const headersByPosition = {
    WR: [
        { key: 'Name', label: 'Player' },
        { key: 'Team', label: 'Team' },
        { key: 'G', label: 'G', tooltip: 'GAMES PLAYED' },
        { key: 'REC', label: 'REC', tooltip: 'RECEPTIONS' },
        { key: 'YDS', label: 'YDS', tooltip: 'RECEPTION YARDS' },
        { key: 'Y/R', label: 'Y/R', tooltip: 'YARDS PER RECEPTION' },
        { key: 'YBC', label: 'YBC', tooltip: 'YARDS BEFORE CATCH' },
        { key: 'YBC/R', label: 'YBC/R', tooltip: 'YARDS BEFORE CATCH PER RECEPTION' },
        { key: 'AIR', label: 'AIR', tooltip: 'AIR YARDS' },
        { key: 'AIR/R', label: 'AIR/R', tooltip: 'AIR YARDS PER RECEPTION' },
        { key: 'YAC', label: 'YAC', tooltip: 'YARDS AFTER CATCH' },
        { key: 'YAC/R', label: 'YAC/R', tooltip: 'YARDS AFTER CATCH PER RECEPTION' },
        { key: 'YACON (Rushing)', label: 'YACON', tooltip: 'YARDS AFTER CONTACT' },
        { key: 'YACON/R', label: 'YACON/R', tooltip: 'YARDS AFTER CONTACT PER RECEPTION' },
        { key: 'BRKTKL', label: 'BRKTKL', tooltip: 'BROKEN TACKLES' },
        { key: 'TGT', label: 'TGT', tooltip: 'TARGETS' },
        { key: '% TM', label: '% TM', tooltip: '% OF TEAM TARGETS' },
        { key: 'CATCHABLE', label: 'CATCHABLE', tooltip: 'CATCHABLE PASSES' },
        { key: 'DROP', label: 'DROP', tooltip: 'DROPPED PASSES' },
        { key: 'RZ TGT', label: 'RZ TGT', tooltip: 'RED ZONE TARGETS' },
        { key: '10+ YDS', label: '10+ YDS', tooltip: 'RECEPTIONS OF 10+ YARDS' },
        { key: '20+ YDS', label: '20+ YDS', tooltip: 'RECEPTIONS OF 20+ YARDS' },
        { key: '30+ YDS', label: '30+ YDS', tooltip: 'RECEPTIONS OF 30+ YARDS' },
        { key: '40+ YDS', label: '40+ YDS', tooltip: 'RECEPTIONS OF 40+ YARDS' },
        { key: '50+ YDS', label: '50+ YDS', tooltip: 'RECEPTIONS OF 50+ YARDS' },
        { key: 'LNG', label: 'LNG', tooltip: 'LONGEST RECEPTION' }
    ],
    QB: [
        { key: 'Name', label: 'Player' },
        { key: 'Team', label: 'Team' },
        { key: 'G', label: 'G', tooltip: 'GAMES PLAYED' },
        { key: 'COMP', label: 'COMP', tooltip: 'COMPLETIONS' },
        { key: 'ATT', label: 'ATT', tooltip: 'ATTEMPTS' },
        { key: 'PCT', label: 'PCT', tooltip: 'COMPLETION PERCENTAGE' },
        { key: 'YDS', label: 'YDS', tooltip: 'PASSING YARDS' },
        { key: 'Y/A', label: 'Y/A', tooltip: 'YARDS PER ATTEMPT' },
        { key: 'AIR', label: 'AIR', tooltip: 'AIR YARDS' },
        { key: 'AIR/A', label: 'AIR/A', tooltip: 'AIR YARDS PER ATTEMPT' },
        { key: '10+ YDS', label: '10+ YDS', tooltip: 'COMPLETIONS OF 10+ YARDS' },
        { key: '20+ YDS', label: '20+ YDS', tooltip: 'COMPLETIONS OF 20+ YARDS' },
        { key: '30+ YDS', label: '30+ YDS', tooltip: 'COMPLETIONS OF 30+ YARDS' },
        { key: '40+ YDS', label: '40+ YDS', tooltip: 'COMPLETIONS OF 40+ YARDS' },
        { key: '50+ YDS', label: '50+ YDS', tooltip: 'COMPLETIONS OF 50+ YARDS' },
        { key: 'PKT TIME', label: 'PKT TIME', tooltip: 'POCKET TIME' },
        { key: 'SACK', label: 'SACK', tooltip: 'TIMES SACKED' },
        { key: 'KNCK', label: 'KNCK', tooltip: 'KNOCKDOWNS' },
        { key: 'HRRY', label: 'HRRY', tooltip: 'HURRIES' },
        { key: 'BLITZ', label: 'BLITZ', tooltip: 'TIMES BLITZED' },
        { key: 'POOR', label: 'POOR', tooltip: 'POOR THROWS' },
        { key: 'DROP', label: 'DROP', tooltip: 'DROPPED PASSES' },
        { key: 'RZ ATT', label: 'RZ ATT', tooltip: 'RED ZONE ATTEMPTS' },
        { key: 'RTG', label: 'RTG', tooltip: 'PASSER RATING' }
    ],
    RB: [
        { key: 'Name', label: 'Player' },
        { key: 'Team', label: 'Team' },
        { key: 'G', label: 'G', tooltip: 'GAMES PLAYED' },
        { key: 'ATT', label: 'ATT', tooltip: 'RUSHING ATTEMPTS' },
        { key: 'YDS', label: 'YDS', tooltip: 'RUSHING YARDS' },
        { key: 'Y/ATT', label: 'Y/A', tooltip: 'YARDS PER ATTEMPT' },
        { key: 'YBCON', label: 'YBC', tooltip: 'YARDS BEFORE CONTACT' },
        { key: 'YBCON/ATT', label: 'YBC/A', tooltip: 'YARDS BEFORE CONTACT PER ATTEMPT' },
        { key: 'YACON (Rushing)', label: 'YACON', tooltip: 'YARDS AFTER CONTACT (RUSHING)' },
        { key: 'YACON/ATT', label: 'YACON/A', tooltip: 'YARDS AFTER CONTACT PER ATTEMPT' },
        { key: 'BRKTKL', label: 'BRKTKL', tooltip: 'BROKEN TACKLES' },
        { key: 'TK LOSS', label: 'TK LOSS', tooltip: 'TACKLES FOR LOSS' },
        { key: 'TK LOSS YDS', label: 'TK LOSS YDS', tooltip: 'YARDS LOST ON TACKLES FOR LOSS' },
        { key: 'LNG TD', label: 'LNG TD', tooltip: 'LONGEST TOUCHDOWN RUN' },
        { key: '10+ YDS', label: '10+ YDS', tooltip: 'RUNS OF 10+ YARDS' },
        { key: '20+ YDS', label: '20+ YDS', tooltip: 'RUNS OF 20+ YARDS' },
        { key: '30+ YDS', label: '30+ YDS', tooltip: 'RUNS OF 30+ YARDS' },
        { key: '40+ YDS', label: '40+ YDS', tooltip: 'RUNS OF 40+ YARDS' },
        { key: '50+ YDS', label: '50+ YDS', tooltip: 'RUNS OF 50+ YARDS' },
        { key: 'LNG', label: 'LNG', tooltip: 'LONGEST RUN' },
        { key: 'REC', label: 'REC', tooltip: 'RECEPTIONS' },
        { key: 'TGT', label: 'TGT', tooltip: 'TARGETS' },
        { key: 'RZ TGT', label: 'RZ TGT', tooltip: 'RED ZONE TARGETS' },
        { key: 'YACON (Receiving)', label: 'YACON (REC)', tooltip: 'YARDS AFTER CONTACT (RECEIVING)' }
    ],
    TE: [
        { key: 'Name', label: 'Player' },
        { key: 'Team', label: 'Team' },
        { key: 'G', label: 'G', tooltip: 'GAMES PLAYED' },
        { key: 'REC', label: 'REC', tooltip: 'RECEPTIONS' },
        { key: 'YDS', label: 'YDS', tooltip: 'RECEPTION YARDS' },
        { key: 'Y/R', label: 'Y/R', tooltip: 'YARDS PER RECEPTION' },
        { key: 'YBC', label: 'YBC', tooltip: 'YARDS BEFORE CATCH' },
        { key: 'YBC/R', label: 'YBC/R', tooltip: 'YARDS BEFORE CATCH PER RECEPTION' },
        { key: 'AIR', label: 'AIR', tooltip: 'AIR YARDS' },
        { key: 'AIR/R', label: 'AIR/R', tooltip: 'AIR YARDS PER RECEPTION' },
        { key: 'YAC', label: 'YAC', tooltip: 'YARDS AFTER CATCH' },
        { key: 'YAC/R', label: 'YAC/R', tooltip: 'YARDS AFTER CATCH PER RECEPTION' },
        { key: 'YACON', label: 'YACON', tooltip: 'YARDS AFTER CONTACT' },
        { key: 'YACON/R', label: 'YACON/R', tooltip: 'YARDS AFTER CONTACT PER RECEPTION' },
        { key: 'BRKTKL', label: 'BRKTKL', tooltip: 'BROKEN TACKLES' },
        { key: 'TGT', label: 'TGT', tooltip: 'TARGETS' },
        { key: '% TM', label: '% TM', tooltip: '% OF TEAM TARGETS' },
        { key: 'CATCHABLE', label: 'CATCHABLE', tooltip: 'CATCHABLE PASSES' },
        { key: 'DROP', label: 'DROP', tooltip: 'DROPPED PASSES' },
        { key: 'RZ TGT', label: 'RZ TGT', tooltip: 'RED ZONE TARGETS' },
        { key: '10+ YDS', label: '10+ YDS', tooltip: 'RECEPTIONS OF 10+ YARDS' },
        { key: '20+ YDS', label: '20+ YDS', tooltip: 'RECEPTIONS OF 20+ YARDS' },
        { key: '30+ YDS', label: '30+ YDS', tooltip: 'RECEPTIONS OF 30+ YARDS' },
        { key: '40+ YDS', label: '40+ YDS', tooltip: 'RECEPTIONS OF 40+ YARDS' },
        { key: '50+ YDS', label: '50+ YDS', tooltip: 'RECEPTIONS OF 50+ YARDS' },
        { key: 'LNG', label: 'LNG', tooltip: 'LONGEST RECEPTION' }
    ]
}

// Default visible columns for each position
export const defaultVisibleColumnsByPosition = {
    WR: ['Name', 'Team', 'G', 'REC', 'YDS', 'Y/R', 'YAC', 'TGT', 'DROP'],
    QB: ['Name', 'Team', 'G', 'COMP', 'ATT', 'PCT', 'YDS', 'Y/A', 'RTG'],
    RB: ['Name', 'Team', 'G', 'ATT', 'YDS', 'Y/ATT', 'YBCON', 'YACON (Rushing)', 'BRKTKL', '10+ YDS', 'REC', 'TGT'],
    TE: ['Name', 'Team', 'G', 'REC', 'YDS', 'Y/R', 'YAC', 'TGT', 'DROP']
}

// Default sort keys for each position
export const defaultSortKeysByPosition = {
    WR: 'YDS',
    QB: 'YDS',
    RB: 'YDS',
    TE: 'YDS'
} 