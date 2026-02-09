import Main from "../Main";
import React from 'react';
import {Icon, Progress} from "antd";
import {MonsterBarColor} from "../Target/Target";

export function getTeam(main: Main) {
    if (!main.state.apiData || !main.state.apiData.players) {
        return null;
    }

    const players = main.state.apiData.players as Array<any>;

    // Don't show damage if no one has done any yet
    if (players.every((player) => player.damage === 0)) {
        return null;
    }

    // Sort from most damage to least
    players.sort((a: { damage: number; }, b: { damage: number; }) => {
        return b.damage - a.damage;
    })

    // Sum everyone's damage
    const teamDamage = players.reduce(
        (acc: number, player: any) => acc + player.damage,
        0
    );

    const highestDamageIndex = 0;

    return players.map((player: any, index: number) => {
        return (
            <div key={player.name} style={{ height: main.getStyle().teamHeight }}>
                <div style={{ display: "flex" }}>
                    <div>
                        <span style={{ fontWeight: "bold", fontSize: main.getStyle().defaultFontSize }}>{player.name} {player.damage}</span>
                        {index == highestDamageIndex ? (<Icon style={{ color: "red", marginLeft: 10, fontSize: main.getStyle().activeTeamIconSize }} type="chrome" spin={true} />) : null}
                    </div>
                    <div style={{ flexGrow: 1, textAlign: "right" }}>
                        <span style={{ color: "white", fontWeight: "bold", fontSize: main.getStyle().defaultFontSize }}>{teamDamage === 0 ? 0 : Math.round((player.damage / teamDamage) * 100)}%</span>
                    </div>
                </div>
                <Progress
                    strokeWidth={main.getStyle().defaultProgressWidth}
                    strokeColor={MonsterBarColor}
                    percent={teamDamage === 0 ? 0 : (player.damage / teamDamage) * 100}
                    showInfo={false}
                />
            </div>
        )
    });
}
