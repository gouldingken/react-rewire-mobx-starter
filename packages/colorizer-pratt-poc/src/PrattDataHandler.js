import classMeetingsData from './class_meetings_2';
import {ADataHandler} from "colorizer-three";

/**
 * Creates a new instance of PrattDataHandler.
 * @class
 * @returns An instance of PrattDataHandler.
 * @example
 * var instance = new PrattDataHandler();
 */
export default class PrattDataHandler extends ADataHandler {

    constructor() {
        super();

        this.colorLookup = {};
        const colorPalette = {
            "Auditorium Permission": "#f584f8",
            "Studio Dedicated": "#78D0CD",
            "Studio Permission": "#b2fedb",
            "Seminar/Conference Open": "#D54779",
            "Seminar/Conference Dedicated": "#B97374",
            "Seminar/Conference Permission": "#C8A9CB",
            "Non-Instructional Lecture Space": "#f2e481",
            "Lecture Hall Permission": "#f0ff00",
            "Lecture Classroom Dedicated": "#cefb44",
            "Lecture Classroom Permission": "#bed621",
            "Lecture Classroom Open": "#b7d50c",
            "Shop Permission": "#ef905a",
            "Shop Dedicated": "#eebd66",
            "Technology Teaching Open": "#6cafd8",
            "Technology Teaching Permission": "#5D8191",
            "Technology Teaching Dedicated": "#83a9b5",
            "#N/A": "#feefff"
        };
        classMeetingsData.Rooms.forEach((room, i) => {
            this.colorLookup[room.RoomId] = colorPalette[room.PrattType];
        });
    };

    getColor(id) {
        return this.colorLookup[id] || super.getColor(id);
    }

    setTime(time) {
        if (time < 1) return;
        this.colorLookup = {};
        const colorPalette = {
            "ART": "#d3463a",
            "DSGN": "#78D0CD",
            "LAS": "#88d71f",
            "CEPS": "#a397cb",
            "ARCH": "#b95c92"
        };

        classMeetingsData.Rooms.forEach((room, i) => {
            let activeMeeting = false;
            room.Meetings.forEach((meeting, i) => {
                if (time >= meeting.Start && time <= meeting.End) {
                    activeMeeting = meeting;
                }
            });
            this.colorLookup[room.RoomId] = activeMeeting ? colorPalette[activeMeeting.School] : '#333333';
        });
    }
}
