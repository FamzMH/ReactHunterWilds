import React from 'react';
import { Layout, Divider, Row, Col, Button } from 'antd';
import * as Api from './MainService';
import './Main.css'
import Config from '../Config';
import {getTarget} from './Target/Target';
import {getTeam} from "./Team/Team";
import {getAbnormalities} from "./Player/Player";

const { Content } = Layout;

const ButtonGroup = Button.Group;

interface IProps {}

interface IState {
    apiData: any;
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
    abnormalityHeight: number;
}

// TODO:
// - Check Rise support

export default class Main extends React.Component<IProps, IState>{
    Interval: NodeJS.Timeout | undefined;
    zoomStyle: Array<IZoomStyle>;
    constructor(props: IProps) {
        super(props);
        this.state = {
            apiData: {},
            zoomLevel: 1,
            imagePath: "../../public/background.jpeg",
            imageHash: Date.now()
        }
        this.zoomStyle = [
            {
                defaultFontSize: 10,
                activeMonsterFontSize: 16,
                activeTeamIconSize: 14,
                defaultProgressWidth: 8,
                activeProgressWidth: 8,
                teamHeight: 50,
                abnormalityHeight: 25
            },
            {
                defaultFontSize: 14,
                activeMonsterFontSize: 20,
                activeTeamIconSize: 18,
                defaultProgressWidth: 10,
                activeProgressWidth: 10,
                teamHeight: 60,
                abnormalityHeight: 30
            },
            {
                defaultFontSize: 18,
                activeMonsterFontSize: 26,
                activeTeamIconSize: 22,
                defaultProgressWidth: 12,
                activeProgressWidth: 12,
                teamHeight: 70,
                abnormalityHeight: 35
            },
            {
                defaultFontSize: 22,
                activeMonsterFontSize: 30,
                activeTeamIconSize: 26,
                defaultProgressWidth: 16,
                activeProgressWidth: 16,
                teamHeight: 80,
                abnormalityHeight: 40
            },
            {
                defaultFontSize: 26,
                activeMonsterFontSize: 36,
                activeTeamIconSize: 30,
                defaultProgressWidth: 20,
                activeProgressWidth: 20,
                teamHeight: 90,
                abnormalityHeight: 45
            }
        ];
    }

    componentDidMount() {
        this.Interval = setInterval(() => {
            this.doInterval();
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.Interval!);
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
            });
        } else {
            console.log(JSON.parse(r.data));
        }
    }

    getStyle = () => {
        return this.zoomStyle[this.state.zoomLevel];
    }

    render() {
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
                backgroundColor: "rgb(81, 81, 81)",
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
                                <Divider orientation="right" style={{ color: 'white' }}>Target</Divider>
                                <div>
                                        {getTarget(this)}
                                </div>
                            </Col>
                            <Col lg={12} style={{ padding: 10 }}>
                                <Divider orientation="right" style={{ color: 'white' }}>Team Damage</Divider>
                                <div>
                                        {getTeam(this)}
                                </div>
                                <Divider orientation="right" style={{ color: 'white' }}>Abnormalities</Divider>
                                <div>
                                        {getAbnormalities(this)}
                                </div>
                            </Col>
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