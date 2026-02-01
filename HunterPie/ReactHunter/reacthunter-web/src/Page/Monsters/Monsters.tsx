import React from 'react';
import { Layout, Progress, Divider, Icon, Row, Col, Collapse, Card, Button } from 'antd';
import '../Main.css'
import Main from "../Main";
import {getSeconds, processMinutes} from "../Timer/Timer";

const { Panel } = Collapse;
const CapturableColour = "#BF40BF";

export const MonsterBarColor = '#108ee9';

export function getMonsters(main: Main) {
    if (!main.state.apiData || !main.state.apiData.monsters) {
        return null;
    }

    const monsterData = main.state.apiData.monsters as Array<any>;
    const preData = main.state.preApiData.monsters as Array<any>;

    main.activeMonsterIndex = getActiveMonsterIndex(monsterData);
    if (main.activeMonsterIndex >= 0) {
        let activeMonster = monsterData[main.activeMonsterIndex];

        // Push active monster to front of monsterData
        monsterData.splice(main.activeMonsterIndex, 1);
        monsterData.unshift(activeMonster);
        main.activeMonsterIndex = 0;
    }

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
                            style={fontStyle}>{monster.name} ({Math.round(monster.health)}/{Math.round(monster.maxHealth)}) {getMonsterCrown(monster)} {getCapturable(monster)}</span>
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
            {/*<span style={{ color: "white", fontWeight: "bold", fontSize: "20px", position: "relative", zIndex: 9999 }}>*/}
            {/*    {main.isInQuest ? "Quest timer: " + processMinutes(main.secondsElapsed) + ":" + getSeconds(main.secondsElapsed) : ""}*/}
            {/*</span>*/}
            <Collapse accordion activeKey={String(main.activeMonsterIndex)}>
                {monsterRender}
            </Collapse>
        </div>
    )
}

function getActiveMonsterIndex(monsterData: Array<any>): number {
    return monsterData.findIndex((monster: any, _: number) => {
       return monster.target == 1;
    });
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
    const captureHealth = monster.captureThreshold * monster.maxHealth;
    return monster.health < captureHealth;
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

            let friendlyName = ailment.id.replace("AILMENT_", "");
            friendlyName = friendlyName[0].toUpperCase() + friendlyName.substr(1).toLowerCase();

            return (
                <Card.Grid key={index} style={{ padding: 5 }}>
                    <div>{friendlyName}</div>
                    <Progress strokeColor="rgb(255, 157, 255)" percent={ailmentBuildupFraction * 100} showInfo={false} />
                    <Progress strokeColor="#8fa7ff" percent={ailmentTimerFraction * 100} showInfo={false} />
                </Card.Grid>);
        }
        else {
            return null;
        }
    });
}

function getMonsterParts(monster: any) {
    return monster.parts.map((part: any) => {
        let timesBrokenCount = 0;
        let partHealthFraction = 0;

        if (part.maxHealth > 0) {
            timesBrokenCount = part.count;
            partHealthFraction = part.health / part.maxHealth;
        } else if (part.maxSever > 0) {
            partHealthFraction = part.sever / part.maxSever;
        } else {
            return null;
        }

        let friendlyName = part.id.replace("PART_", "");
        friendlyName = friendlyName[0].toUpperCase() + friendlyName.substr(1).toLowerCase();

        return (
            <Col key={monster.name + part.id} span={6} style={{textAlign: "center"}}>
                <div>{timesBrokenCount === 0 ? friendlyName : friendlyName + ": " + timesBrokenCount}</div>
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
