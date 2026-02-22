import React from "react";
import Main from "../Main";
import {Card, Divider, Progress} from "antd";
import {CapturableColour, MonsterBarColor} from "../Target/Target";

enum AbnormalityType {
    Debuff = 4,
}

export function getAbnormalities(main: Main) {
    if (!main.state.apiData) {
        return null;
    }

    if ((!main.state.apiData.abnormalities || main.state.apiData.abnormalities.length === 0)
        && (!main.state.apiData.tools || main.state.apiData.tools.length === 0)) {
        return null;
    }

    const abnormalities = main.state.apiData.abnormalities as Array<any>;
    const tools = main.state.apiData.tools as Array<any>;
    const abnormalitiesLocalizations = main.state.apiData.localizations.abnormalities as { [p: string]: string; };
    const toolsLocalizations = main.state.apiData.localizations.tools as { [p: string]: string; };

    let toolsRender = tools.map((tool: any) => {
        let toolName = toolsLocalizations[tool.id];

        let percent;
        let format: any;
        let strokeColor;
        if (tool.timer > 0) {
            percent = (tool.timer / tool.maxTimer) * 100;
            format = <span style={{color: "white"}}>{Math.floor(tool.timer)}s</span>
            strokeColor = CapturableColour
        } else if (tool.cooldown > 0) {
            percent = (tool.cooldown / tool.maxCooldown) * 100;
            format = <span style={{color: "white"}}>{Math.floor(tool.cooldown)}s</span>
            strokeColor = MonsterBarColor;
            toolName = toolName + " (cooldown)"
        } else {
            return null
        }

        return (
            <Card.Grid key={tool.id} style={{ padding: 5 }}>
                <div>{toolName}</div>
                <Progress
                    percent={percent}
                    format={_ => (format)}
                    strokeColor={strokeColor}
                />
            </Card.Grid>
        );
    });

    // Remove the nulls from toolsRender
    toolsRender = toolsRender.filter(tool => tool);

    const permanentRender = abnormalities.filter((a) => {
        return a.isInfinite;
    }).map((abnormality: any) => {
        const abnormalityName = abnormalitiesLocalizations[abnormality.name.toLowerCase()];

        return (
            <div key={abnormality.id} style={{height: main.getStyle().abnormalityHeight}}>
                <div style={{display: "flex"}}>
                    <div>
                            <span style={{
                                fontWeight: "bold",
                                fontSize: main.getStyle().defaultFontSize
                            }}>{abnormalityName}</span>
                    </div>
                </div>
            </div>
        );
    });

    const buffsRender = abnormalities.filter((a) => {
        return a.type !== AbnormalityType.Debuff && !a.isInfinite;
    }).map((abnormality: any) => {
        const abnormalityName = abnormalitiesLocalizations[abnormality.name.toLowerCase()];

        if (abnormality.timer > 0) {
            const percent = (abnormality.timer / abnormality.maxTimer) * 100;
            const format = <span style={{color: "white"}}>{Math.floor(abnormality.timer)}s</span>

            return (
                <Card.Grid key={abnormality.id} style={{ padding: 5 }}>
                    <div>{abnormalityName}</div>
                    <Progress
                        percent={percent}
                        format={_ => (format)}
                        strokeColor={CapturableColour}
                    />
                </Card.Grid>
            );
        }

        return null;
    });

    const debuffsRender = abnormalities.filter((a) => {
        return a.type === AbnormalityType.Debuff && !a.isInfinite;
    }).map((abnormality: any) => {
        const abnormalityName = abnormalitiesLocalizations[abnormality.name.toLowerCase()];

        if (abnormality.timer > 0) {
            const percent = (abnormality.timer / abnormality.maxTimer) * 100;
            let format = <span style={{color: "white"}}>{Math.floor(abnormality.timer)}s</span>

            if (abnormality.isBuildup) {
                format = <span style={{color: "white"}}>{Math.floor(abnormality.timer)}%</span>
            }

            return (
                <Card.Grid key={abnormality.id} style={{ padding: 5 }}>
                    <div>{abnormalityName}</div>
                    <Progress
                        percent={percent}
                        format={_ => (format)}
                        strokeColor={"red"}
                    />
                </Card.Grid>
            );
        }

        return null;
    });

    return (
        <div>
            {toolsRender.length > 0 && <Divider orientation="left" style={{ color: 'white' }}>Mantles</Divider>}
            {toolsRender}
            {permanentRender.length > 0 && <Divider orientation="left" style={{ color: 'white' }}>Permanent buffs</Divider>}
            {permanentRender}
            {buffsRender.length > 0 && <Divider orientation="left" style={{ color: 'white' }}>Active buffs</Divider>}
            {buffsRender}
            {debuffsRender.length > 0 && <Divider orientation="left" style={{ color: 'white' }}>Active debuffs</Divider>}
            {debuffsRender}
        </div>
    )
}