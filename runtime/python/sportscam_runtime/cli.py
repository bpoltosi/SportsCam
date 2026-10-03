import argparse,json
from .core.models import ClipRequest,SegmentRequest
from .devices.registry import build_device
from .media.ffmpeg import create_clip,split_segments
from .media.replay import create_replay_clip

def main()->int:
    parser=argparse.ArgumentParser(prog="sportscam-runtime"); sub=parser.add_subparsers(dest="command",required=True)
    sub.add_parser("devices")
    clip=sub.add_parser("clip"); clip.add_argument("--input",required=True); clip.add_argument("--start",required=True); clip.add_argument("--duration",required=True,type=float); clip.add_argument("--output",required=True); clip.add_argument("--reencode",action="store_true"); clip.add_argument("--overwrite",action="store_true")
    replay=sub.add_parser("replay"); replay.add_argument("--input",required=True); replay.add_argument("--event",required=True,type=float); replay.add_argument("--pre",default=10,type=float); replay.add_argument("--post",default=10,type=float); replay.add_argument("--output",required=True); replay.add_argument("--reencode",action="store_true"); replay.add_argument("--overwrite",action="store_true")
    segments=sub.add_parser("segments"); segments.add_argument("--input",required=True); segments.add_argument("--segment",default=60,type=int); segments.add_argument("--output",required=True); segments.add_argument("--format",default="mkv"); segments.add_argument("--overwrite",action="store_true")
    status=sub.add_parser("status"); status.add_argument("--config",required=True)
    args=parser.parse_args()
    if args.command=="devices":
        print(json.dumps(["rtsp_camera","onvif_camera","http_camera","uvc_camera","serial","gpio","nvr"],indent=2)); return 0
    if args.command=="clip":
        print(create_clip(ClipRequest(args.input,args.output,args.start,args.duration,stream_copy=not args.reencode,overwrite=args.overwrite))); return 0
    if args.command=="replay":
        print(create_replay_clip(args.input,args.output,args.event,args.pre,args.post,not args.reencode,args.overwrite)); return 0
    if args.command=="segments":
        print(json.dumps([str(p) for p in split_segments(SegmentRequest(args.input,args.output,args.segment,args.format,args.overwrite))],indent=2)); return 0
    if args.command=="status":
        config=json.loads(open(args.config,encoding="utf-8").read()); device=build_device(config)
        try: print(json.dumps({"id":device.info.id,"kind":device.info.kind.value,"status":device.status().__dict__},indent=2))
        finally: device.close()
        return 0
    return 1

if __name__=="__main__": raise SystemExit(main())
