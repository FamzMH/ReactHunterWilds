import React from 'react';
import { Layout, Progress, Divider, Icon, Row, Col, Collapse, Card, Button } from 'antd';
import * as Api from './MainService';
import './Main.css'
import Config from '../Config';
import {getMonsters, MonsterBarColor} from './Monsters/Monsters';
import {getMinutes, getSeconds} from "./Timer/Timer";

const { Content } = Layout;

const ButtonGroup = Button.Group;

interface IProps {

}

interface IState {
    apiData: any;
    preApiData: any;
    zoomLevel: number;
    imagePath: string;
    imageHash: any
}

interface IZoomStyle {
    defaultFontSize: number;
    activeMonsterFontSize: number;
    activeTeamIconSize: number;
    defaultProgressWidth: number;
    activeProgressWidth: number;
    teamHeight: number;
    seHeight: number;
}

export default class Main extends React.Component<IProps, IState>{
    Interval: NodeJS.Timeout | undefined;
    SEInterval: NodeJS.Timeout | undefined;
    activeMonsterIndex: number;
    zoomStyle: Array<IZoomStyle>;
    lastUpdateTime: number;
    isInQuest: boolean;
    currentlyActiveStatusEffects: string[];
    questStartTime: number;
    secondsElapsed: number;
    constructor(props: IProps) {
        super(props);
        this.state = {
            apiData: {},
            preApiData: {},
            zoomLevel: 1,
            imagePath: "../../public/background.jpeg",
            imageHash: Date.now()
        }
        this.activeMonsterIndex = 0;
        // Tracks the last time data was pushed successfully from Smart Hunter
        this.lastUpdateTime = 0;
        this.isInQuest = false;
        // Keeps track of whether React Hunter is currently showing any active status effects
        this.currentlyActiveStatusEffects = [];
        this.questStartTime = 0;
        this.secondsElapsed = 0;
        this.zoomStyle = [
            {
                defaultFontSize: 10,
                activeMonsterFontSize: 16,
                activeTeamIconSize: 14,
                defaultProgressWidth: 8,
                activeProgressWidth: 8,
                teamHeight: 50,
                seHeight: 25
            },
            {
                defaultFontSize: 14,
                activeMonsterFontSize: 20,
                activeTeamIconSize: 18,
                defaultProgressWidth: 10,
                activeProgressWidth: 10,
                teamHeight: 60,
                seHeight: 30
            },
            {
                defaultFontSize: 18,
                activeMonsterFontSize: 26,
                activeTeamIconSize: 22,
                defaultProgressWidth: 12,
                activeProgressWidth: 12,
                teamHeight: 70,
                seHeight: 35
            },
            {
                defaultFontSize: 22,
                activeMonsterFontSize: 30,
                activeTeamIconSize: 26,
                defaultProgressWidth: 16,
                activeProgressWidth: 16,
                teamHeight: 80,
                seHeight: 40
            },
            {
                defaultFontSize: 26,
                activeMonsterFontSize: 36,
                activeTeamIconSize: 30,
                defaultProgressWidth: 20,
                activeProgressWidth: 20,
                teamHeight: 90,
                seHeight: 45
            }
        ];
    }

    componentDidMount() {
        this.Interval = setInterval(() => {
            this.doInterval();
        }, 500);

        // this.SEInterval = setInterval(() => {
        //     this.doSEInterval();
        // }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.Interval!);
        // clearInterval(this.SEInterval!);
    }

    doInterval = async () => {
        let _r = await Api.GetData();
        let r = _r;
        if (!Config.fakeApi) {
            r = JSON.parse(_r);
        }

        if (r.isSuccess) {
            this.setState({
                apiData: r.data,
                preApiData: this.state.apiData
            });

            if (this.state.apiData.monsters.length > 0) {
                this.lastUpdateTime = Date.now();
            }
        } else {
            console.log(JSON.parse(r.data));
        }
    }

    // doSEInterval = async () => {
    //     var currentTime = Date.now();
    //     if ((currentTime - this.lastUpdateTime) / 1000 > 1) {
    //         // More than 1 second has elapsed (i.e. more than 2 rerenders or "API updates") since the last time lastUpdateTime was updated so we assume the player is not in a quest
    //         // Therefore, we reset state for timers and status effects
    //         this.isInQuest = false;
    //         this.lastUpdateTime = 0;
    //         if (this.currentlyActiveStatusEffects.length !== 0) {
    //             this.currentlyActiveStatusEffects = [];
    //             // Player has left the quest, but they still have active status effects so we need to force a rerender by setting the state to reset the timers
    //             this.setState({
    //                 apiData: this.state.apiData,
    //                 preApiData: this.state.preApiData,
    //             })
    //         }
    //         if (this.questStartTime !== 0) {
    //             this.questStartTime = 0;
    //             this.secondsElapsed = 0;
    //         }
    //     } else {
    //         if (this.questStartTime === 0) {
    //             this.questStartTime = Date.now();
    //         } else {
    //             this.secondsElapsed = Math.round((Date.now() - this.questStartTime) / 1000);
    //         }
    //         this.isInQuest = true;
    //     }
    // }

    getStyle = () => {
        return this.zoomStyle[this.state.zoomLevel];
    }

    render() {
        let getTeam = () => {
            if (!this.state.apiData || !this.state.apiData.players) {
                return null;
            }
            var data = this.state.apiData.players;
            var teamDamage = 0;
            var _tempDamage = 0;
            var _tempIndex = 0;
            data.forEach((m: any, index: number) => {
                if (m.damage > _tempDamage) {
                    _tempDamage = m.damage;
                    _tempIndex = index;
                }
                teamDamage += m.damage;
            });
            return data.map((p: any, index: number) => {
                if (p.name == "未知玩家") {
                    return null;
                }
                else {
                    return (
                        <div key={p.name} style={{ height: this.getStyle().teamHeight }}>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <span style={{ fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{p.name} {p.damage}</span>
                                    {index == _tempIndex ? (<Icon style={{ color: "red", marginLeft: 10, fontSize: this.getStyle().activeTeamIconSize }} type="chrome" spin={true} />) : null}
                                </div>
                                <div style={{ flexGrow: 1, textAlign: "right" }}>
                                    <span style={{ color: "white", fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{teamDamage === 0 ? 0 : Math.round((p.damage / teamDamage) * 100)}%</span>
                                </div>
                            </div>
                            <Progress
                                strokeWidth={this.getStyle().defaultProgressWidth}
                                strokeColor={MonsterBarColor}
                                percent={teamDamage === 0 ? 0 : (p.damage / teamDamage) * 100}
                                showInfo={false}
                            />
                        </div>
                    )
                }
            });
        }

        let getPlayer = () => {
            if (!this.state.apiData || !this.state.apiData.player) {
                return null;
            }
            var data = this.state.apiData.player
            return data.map((se: any, index: number) => {
                var isMantle = se.name.includes("Mantle");
                if (!this.isInQuest) {
                    if (this.currentlyActiveStatusEffects.includes(se.name)) this.currentlyActiveStatusEffects.splice(this.currentlyActiveStatusEffects.indexOf(se.name), 1);
                    return null;
                }
                if (!se.isVisible) {
                    if (this.currentlyActiveStatusEffects.includes(se.name)) this.currentlyActiveStatusEffects.splice(this.currentlyActiveStatusEffects.indexOf(se.name), 1);
                    return null;
                } else {
                    this.currentlyActiveStatusEffects.push(se.name);
                }
                // To handle status effects like Mega Demondrug
                if (se.time === null) {
                    return (
                        <div key={se.name} style={{ height: this.getStyle().seHeight }}>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <span style={{ fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{se.name}</span>
                                </div>
                            </div>
                        </div>
                    );

                }
                else if (Math.round(se.time.current) <= 1) {
                    if (this.currentlyActiveStatusEffects.includes(se.name)) this.currentlyActiveStatusEffects.splice(this.currentlyActiveStatusEffects.indexOf(se.name), 1);
                    return null;
                }
                else if (se.groupId === "Debuff") {
                    return (
                        <div key={se.name} style={{ height: this.getStyle().seHeight }}>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <span style={{ color: "red", fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{se.name + " " + getMinutes(Math.round(se.time.current)) + ":" + getSeconds(Math.round(se.time.current))}</span>
                                </div>
                            </div>
                        </div>
                    );

                } else if (isMantle) {
                    return (
                        <div key={se.name} style={{ height: this.getStyle().seHeight }}>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <span style={{ color: "gold", fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{se.name + " " + getMinutes(Math.round(se.time.current)) + ":" + getSeconds(Math.round(se.time.current))}</span>
                                </div>
                            </div>
                        </div>
                    );

                } else {
                    return (
                        <div key={se.name} style={{ height: this.getStyle().seHeight }}>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <span style={{ color: "white", fontWeight: "bold", fontSize: this.getStyle().defaultFontSize }}>{se.name + " " + getMinutes(Math.round(se.time.current)) + ":" + getSeconds(Math.round(se.time.current))}</span>
                                </div>
                            </div>
                        </div>
                    );
                }
            });
        }

        let onZoomChange = (isZoomIn: boolean) => {
            if (isZoomIn) {
                if (this.state.zoomLevel >= this.zoomStyle.length - 1) {
                    return;
                }

                this.setState({
                    zoomLevel: this.state.zoomLevel + 1
                })
            } else {
                if (this.state.zoomLevel <= 0) {
                    return;
                }

                this.setState({
                    zoomLevel: this.state.zoomLevel - 1
                })
            }
        }

        return (
            <Layout className="layout" style={{
                height: "100vh",
                color: "rgb(255, 255, 255)",
                backgroundImage: `url(${this.state.imagePath}?${this.state.imageHash})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
            }}>
                <Content style={{ padding: '10px', height: "100%" }}>
                    <div style={{ color: "rgb(255, 255, 255)", padding: 10, minHeight: "100%" }}>
                        <div style={{ color: "white", fontWeight: "bold", fontSize: "20px", position: "absolute", margin: "0px 10px", zIndex: 9999 }}>
                            React Hunter
                            <ButtonGroup style={{ marginLeft: 20, zIndex: 9999 }}>
                                <Button type="primary" icon="zoom-in" onClick={e => { onZoomChange(true) }} />
                                <Button type="primary" icon="zoom-out" onClick={e => { onZoomChange(false) }} />
                            </ButtonGroup>
                        </div>
                        <Row>
                            <Col lg={12} style={{ padding: 10 }}>
                                <Divider orientation="right" style={{ color: 'white' }}>Monsters</Divider>
                                <div>
                                        {getMonsters(this)}
                                </div>
                            </Col>
                            {/*<Col lg={12} style={{ padding: 10 }}>*/}
                            {/*    <Divider orientation="right" style={{ color: 'white' }}>Team Damage</Divider>*/}
                            {/*    <div>*/}
                            {/*            {getTeam()}*/}
                            {/*        </div>*/}
                            {/*    <Divider orientation="right" style={{ color: 'white' }}>Status Effects</Divider>*/}
                            {/*    <div>*/}
                            {/*            {getPlayer()}*/}
                            {/*        </div>*/}
                            {/*</Col>*/}
                        </Row>
                        <Row>
                            <Col lg={12} style={{ padding: 10 }}></Col>
                            <Col lg={12} style={{ padding: 10 }}>

                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        );
    }
}