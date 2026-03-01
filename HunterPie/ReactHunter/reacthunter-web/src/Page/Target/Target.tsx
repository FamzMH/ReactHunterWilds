import React from 'react';
import {Progress, Icon, Row, Col, Collapse, Card} from 'antd';
import '../Main.css'
import Main from "../Main";
import {getSeconds, processMinutes} from "../Timer/Timer";

const { Panel } = Collapse;
export const CapturableColour = '#bf40bf';

enum PartType {
    Flinch = 1 << 1,
    Breakable = 1 << 2,
    Severable = 1 << 3
}

export const MonsterBarColor = '#108ee9';

export function getTarget(main: Main) {
    if (!main.state.apiData || !main.state.apiData.target) {
        return null;
    }

    const target = main.state.apiData.target as any;
    const timeLeft = main.state.apiData.timeLeft as number;
    const targetLocalizations = main.state.apiData.localizations.target as { [p: string]: string; };

    let fontStyle: any = {
        fontWeight: "bold",
        fontSize: main.getStyle().activeMonsterFontSize
    }

    const targetHealthFraction = target.health / target.maxHealth;

    return (
        <div>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "20px", position: "relative", zIndex: 9999 }}>
                {timeLeft > 0 ? "Quest timer: " + processMinutes(timeLeft) + ":" + getSeconds(timeLeft) : ""}
            </span>
            <Collapse accordion activeKey={String(target.name)}>
                <Panel showArrow={false} key={target.name} header={(
                    <div
                        style={{height: main.getStyle().teamHeight - 20}}>
                        <div style={{display: "flex"}}>
                        <span
                            style={fontStyle}>{target.name} ({Math.round(target.health)}/{Math.round(target.maxHealth)}) {showCrown(target)} {showCapturable(target)}</span>
                            <div style={{flexGrow: 1, textAlign: "right"}}>
                            <span style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: main.getStyle().defaultFontSize
                            }}>{Math.round(targetHealthFraction * 100)}%</span>
                            </div>

                        </div>
                        <Progress
                            strokeWidth={main.getStyle().activeProgressWidth}
                            status="active"
                            strokeColor={isCapturable(target) ? CapturableColour : "red"}
                            percent={targetHealthFraction * 100}
                            showInfo={false}
                        />
                    </div>
                )}>
                    <Row>
                        <Col span={24}>{getAilments(target.ailments, targetLocalizations)}</Col>
                        <Col span={24} style={{height: 10}}></Col>
                        {getMonsterParts(target, targetLocalizations)}
                    </Row>
                    <div style={{height: "10px"}}></div>
                </Panel>
            </Collapse>
        </div>
    )
}

function showCrown(data: any) {
    if (data.crown === 1) {
        return (<Icon type="trophy" theme="twoTone" twoToneColor="darkgray" />)
    }
    else if (data.crown === 2) {
        return (<Icon type="trophy" theme="twoTone" twoToneColor="darkgoldenrod" />)
    }
    else if (data.crown === 3) {
        return (<Icon type="smile" theme="twoTone" twoToneColor="darkgoldenrod" />)
    }
}

function showCapturable(monster: any) {
    if (isCapturable(monster)) {
        return (<Icon type="copyright" theme="twoTone" twoToneColor={CapturableColour} />)
    }
}

function isCapturable(monster: any) {
    const captureHealth = monster.captureThreshold * monster.maxHealth;
    return monster.health < captureHealth;
}

function getAilments(ailments: any, localizations: { [p: string]: string; }) {
    if (!ailments) {
        return null
    }

    return ailments.map((ailment: any) => {
        if (ailment) {
            if (!(ailment.timer > 0 || ailment.buildUp > 0)) {
                return null
            }

            if (!ailment.id.startsWith("AILMENT_") || ailment.id.toUpperCase() === "AILMENT_UNKNOWN") {
                return null
            }

            let friendlyName = localizations[ailment.id.toLowerCase()];

            let percent: number;
            let format: {} | null | undefined = null;
            let strokeColor: string;
            if (ailment.timer > 0) {
                percent = (ailment.timer / ailment.maxTimer) * 100;
                format = <span style={{color: "white"}}>{Math.floor(ailment.timer)}s</span>
                strokeColor = CapturableColour
            } else {
                percent = (ailment.buildUp / ailment.maxBuildUp) * 100;
                format = <span style={{color: "white"}}>{Math.floor(percent)}%</span>
                strokeColor = MonsterBarColor
            }

            return (
                <Card.Grid key={ailment.id} style={{ padding: 5 }}>
                    <div>{friendlyName}</div>
                    <Progress
                        percent={percent}
                        format={_ => (format)}
                        strokeColor={strokeColor}
                    />
                </Card.Grid>);
        }
        else {
            return null;
        }
    });
}

function getMonsterParts(monster: any, localizations: { [p: string]: string; }) {
    // Keep track of part IDs that are already rendered.
    // Some parts have a separate "part" just for flinch
    // values, unsure why.
    let seen: string[] = [];

    // Sort breakable and severable parts before flinch parts
    monster.parts.sort((a: { type: number; }, b: { type: number; }) => {
        return b.type - a.type;
    })

    return monster.parts.map((part: any) => {
        if (!part.id.startsWith("PART_") || part.id.toUpperCase() === "PART_UNKNOWN") {
            return null
        }

        let timesBrokenCount = 0;
        let partHealthFraction = 0;

        if (seen.includes(part.id)) {
            return null;
        }

        if (part.type === PartType.Breakable) {
            timesBrokenCount = part.count;
            partHealthFraction = part.health / part.maxHealth;
        } else if (part.type === PartType.Severable) {
            partHealthFraction = part.sever / part.maxSever;
            if (partHealthFraction === 1) {
                // When a severable part is already severed HunterPie
                // returns its health as 100%.
                return null;
            }
        } else if (part.type === PartType.Flinch && !seen.includes(part.id)) {
            partHealthFraction = part.flinch / part.maxFlinch;
        } else {
            return null;
        }

        if (!(partHealthFraction > 0)) {
            return null;
        }

        seen.push(part.id);

        let friendlyName = localizations[part.id.toLowerCase()];

        return (
            <Col key={part.id} span={6} style={{textAlign: "center"}}>
                <div>{timesBrokenCount === 0 ? friendlyName : friendlyName + ": " + timesBrokenCount}</div>
                <Progress
                    type="circle"
                    percent={partHealthFraction * 100}
                    width={65}
                    format={percent => (
                        // @ts-ignore
                        <span style={{color: "white"}}>{Math.floor(percent)}%</span>)}
                />
            </Col>
        );
    });
}
