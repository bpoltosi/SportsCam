import { describe, expect, it } from "vitest";
import { resolveProject } from "../packages/engine/src/engine.js";

const base={modules:[{id:"camera",version:"1"},{id:"recording",version:"1",requires:["camera"]}],hardware:[{id:"cam-a",category:"camera",model:"A",capabilities:{fps:60}},{id:"cam-b",category:"camera",model:"B",capabilities:{fps:30}}],rules:[]};

describe("SportsCam Engine",()=>{
  it("resolves transitive dependencies deterministically",()=>{
    const result=resolveProject({project:{id:"demo",version:"1",sport:"football",modules:["recording"]}},base);
    expect(result.valid).toBe(true);
    expect(result.modules).toEqual(["camera","recording"]);
    expect(result.dependencies).toEqual(["camera"]);
  });
  it("does not invent unknown modules",()=>{
    const result=resolveProject({project:{id:"demo",version:"1",sport:"football",modules:["missing"]}},{...base,modules:[]});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="MODULE_NOT_FOUND")).toBe(true);
  });
  it("rejects duplicate catalog identifiers",()=>{
    const result=resolveProject({project:{id:"demo",version:"1",sport:"football",modules:[]}},{...base,hardware:[...base.hardware,...base.hardware.slice(0,1)]});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="DUPLICATE_HARDWARE")).toBe(true);
  });
  it("validates hardware quantity and unknown hardware",()=>{
    const result=resolveProject({project:{id:"demo",version:"1",sport:"football",modules:[],hardware:[{id:"missing",quantity:1},{id:"cam-a",quantity:0}]}},base);
    expect(result.valid).toBe(false);
    expect(result.diagnostics.map(d=>d.code)).toContain("HARDWARE_NOT_FOUND");
    expect(result.diagnostics.map(d=>d.code)).toContain("INVALID_HARDWARE_QUANTITY");
  });
  it("applies capability rules",()=>{
    const result=resolveProject({project:{id:"demo",version:"1",sport:"football",modules:["recording"]}},{...base,rules:[{id:"needs-4k",when:{module:"recording"},then:{requiresCapability:{key:"resolution",value:"4k"}},severity:"error",message:"4K camera required"}]});
    expect(result.valid).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("RULE_CAPABILITY_UNAVAILABLE");
  });
});
