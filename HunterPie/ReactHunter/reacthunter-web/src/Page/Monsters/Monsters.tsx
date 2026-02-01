import React from 'react';
import { Layout, Progress, Divider, Icon, Row, Col, Collapse, Card, Button } from 'antd';
import '../Main.css'
import Main from "../Main";
import {getSeconds, processMinutes} from "../Timer/Timer";

const { Panel } = Collapse;
const CapturableColour = "#BF40BF";

export const MonsterBarColor = '#108ee9';

function getMonsterParts(monster: any) {
    return monster.parts.map((part: any) => {
        let timesBrokenCount = part.count;
        let partHealthFraction = part.health / part.maxHealth;

        return (
            <Col key={monster.id + part.name} span={6} style={{textAlign: "center"}}>
                <div>{timesBrokenCount === 0 ? part.name : part.name + ": " + timesBrokenCount}</div>
                <Progress
                    type="circle"
                    percent={partHealthFraction * 100}
                    width={65}
                    format={_percent => (
                        <span style={{color: "white"}}>{Math.floor(partHealthFraction * 100)}%</span>)}
                />
            </Col>
        );
    });
}

export function getMonsters(main: Main) {
    if (!main.state.apiData || !main.state.apiData.monsters) {
        return null;
    }

    const monsterData = main.state.apiData.monsters as Array<any>;
    const previousMonsterData = main.state.preApiData.monsters as Array<any>;

    main.activeMonsterIndex = getActiveMonsterIndex(previousMonsterData, monsterData);

    const monsterRender = monsterData.map((monster: any, index: number) => {
        let fontStyle: any = {
            fontWeight: "bold",
            fontSize: main.getStyle().defaultFontSize
        }

        if (index == main.activeMonsterIndex) {
            fontStyle.fontSize = main.getStyle().activeMonsterFontSize;
        }

        const monsterHealthFraction = monster.health / monster.maxHealth;

        return (
            <Panel showArrow={false} key={String(index)} header={(
                <div
                    style={{height: index == main.activeMonsterIndex ? main.getStyle().teamHeight - 20 : main.getStyle().teamHeight - 25}}>
                    <div style={{display: "flex"}}>
                        <span
                            style={fontStyle}>{monster.name} ({Math.round(monster.health)}/{monster.maxHealth}) {getMonsterCrown(monster)} {getCapturable(monster)}</span>
                        <div style={{flexGrow: 1, textAlign: "right"}}>
                            <span style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: main.getStyle().defaultFontSize
                            }}>{Math.round(monsterHealthFraction * 100)}%</span>
                        </div>

                    </div>
                    <Progress
                        strokeWidth={index == main.activeMonsterIndex ? main.getStyle().activeProgressWidth : main.getStyle().defaultProgressWidth}
                        status="active"
                        strokeColor={index == main.activeMonsterIndex ? (isCapturable(monster) ? CapturableColour : "red") : MonsterBarColor}
                        percent={monsterHealthFraction * 100}
                        showInfo={false}
                    />
                </div>
            )}>
                <Row>
                    <Col span={24}>{getAilments(monster.ailments)}</Col>
                    <Col span={24} style={{height: 10}}></Col>
                    {getMonsterParts(monster)}
                </Row>
                <div style={{height: "10px"}}></div>
            </Panel>
        )
    });

    return (
        <div>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "20px", position: "relative", zIndex: 9999 }}>
                {main.isInQuest ? "Quest timer: " + processMinutes(main.secondsElapsed) + ":" + getSeconds(main.secondsElapsed) : ""}
            </span>
            <Collapse accordion activeKey={String(main.activeMonsterIndex)}>
                {monsterRender}
            </Collapse>
        </div>
    )
}

function getActiveMonsterIndex(previousMonsterData: Array<any>, monsterData: Array<any>): number {
    let activeMonsterIndex = 0;

    if (previousMonsterData?.length == monsterData?.length &&
        previousMonsterData.every((monster: any, i: number) => monsterData[i].name == monster.name)) {
        // The monster with the biggest health difference since
        // the last update is probably the current target.
        let activeMonsterHealthDifference = 0;

        previousMonsterData.forEach((previousMonster: any, index: number) => {
            const monsterHealthDifference = previousMonster.health - monsterData[index].health;
            if (monsterHealthDifference > activeMonsterHealthDifference) {
                activeMonsterHealthDifference = monsterHealthDifference;
                activeMonsterIndex = index;
            }
        });
    } else {
        // The monster with the lowest health fraction is probably the target.
        let lowestHealthFraction = 2;

        monsterData.forEach((monster: any, index: number) => {
            const fraction = monster.health / monster.maxHealth;
            if (fraction < lowestHealthFraction && fraction > 0) {
                lowestHealthFraction = fraction;
                activeMonsterIndex = index;
            }
        });
    }

    return activeMonsterIndex;
}

function getMonsterCrown(data: any) {
    if (data.crown == 1) {
        return (<Icon type="trophy" theme="twoTone" twoToneColor="darkgray" />)
    }
    else if (data.crown == 2) {
        return (<Icon type="trophy" theme="twoTone" twoToneColor="darkgoldenrod" />)
    }
    else if (data.crown == 3) {
        return (<Icon type="smile" theme="twoTone" twoToneColor="darkgoldenrod" />)
    }
}

function isCapturable(monster: any) {
    return monster.health < monster.captureThreshold;
}

function getCapturable(monster: any) {
    if (isCapturable(monster)) {
        return (<Icon type="copyright" theme="twoTone" twoToneColor={CapturableColour} />)
    }
}

function getAilments(data: any) {
    if (!data) {
        return null
    }

    return data.map((ailment: any, index: number) => {
        if (ailment.buildUp > 0) {
            const ailmentBuildupFraction = ailment.buildUp / ailment.maxBuildUp;
            const ailmentTimerFraction = ailment.timer / ailment.maxTimer;

            return (
                <Card.Grid key={index} style={{ padding: 5 }}>
                    <div>{ailment.definition.string}</div>
                    <Progress strokeColor="rgb(255, 157, 255)" percent={ailmentBuildupFraction * 100} showInfo={false} />
                    <Progress strokeColor="#8fa7ff" percent={ailmentTimerFraction * 100} showInfo={false} />
                </Card.Grid>);
        }
        else {
            return null;
        }
    });
}
