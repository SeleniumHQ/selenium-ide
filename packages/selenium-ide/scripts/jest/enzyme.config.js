import "jest-enzyme"; // pulls in matchers
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() }); // "environment" setup for adapter
