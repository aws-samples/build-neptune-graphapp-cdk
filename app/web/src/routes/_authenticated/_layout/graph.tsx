import { useEffect, useState } from "react";
import SpriteText from "three-spritetext";
import ForceGraph3D, { NodeObject } from "react-force-graph-3d";
import { createFileRoute } from "@tanstack/react-router";
import { omitBy, map, includes, trim, find } from "lodash-es";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Profiles } from "@/data/data";
import { Graph } from "@/types/types";
import { queryGetGraph, queryGetProfile } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/_layout/graph")({
  component: Graph3D,
});

function Graph3D() {
  const [value] = useState("id");
  const [name, setName] = useState("");
  const [state, setState] = useState<{
    nodes: Array<{
      id: string;
      label: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      value: string;
    }>;
  }>({ nodes: [], links: [] });
  const [profile, setProfile] = useState<
    Array<{
      search_name: string;
      usage?: string;
      belong_to?: string;
      authored_by?: string;
      affiliated_with?: string;
      people?: string;
      made_by?: string | null;
    }>
  >([]);
  const [open, setOpen] = useState(false);
  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  const [displayHeight, setDisplayHeight] = useState(window.innerHeight);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  window.addEventListener("resize", () => {
    setDisplayWidth(window.innerWidth);
    setDisplayHeight(window.innerHeight);
  });
  const onSubmit = async () => {
    try {
      const res = await queryGetGraph(value);
      setState(res.data.getGraph);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Query Error",
        description: error.errors[0].message,
      });
    }
  };
  const getInformation = async () => {
    try {
      setIsLoading(true);
      const res = await queryGetProfile(name, value);
      setProfile(res.data.getProfile);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Query Error",
        description: error.errors[0].message,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getInformation();
  }, [name]);

  useEffect(() => {
    onSubmit();
  }, []);

  const Details = () => {
    const res = omitBy(profile[0], (value: string) => {
      return includes(value, "[]");
    });

    const data: Graph[] = [];
    map(res, (value, key) => {
      find(Profiles, (obj) => {
        if (obj.value === key) {
          const res = { ...obj, data: value };
          data.push(res);
        }
      });
    });

    return (
      <>
        <div className="flex flex-col py-8">
          {map(data, (value: Graph, index: number) => (
            <div key={index.toString()}>
              <div className="flex flex-row justify-between py-4">
                <div className="basis=1/4 font-bold">{value.description}</div>
              </div>
              <div className="basis=1/4 py-4">{trim(value.data, "[]")}</div>
              <Separator />
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <main className="grid items-center flex-1 gap-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Relation</SheetTitle>
          </SheetHeader>
          {isLoading ? (
            <>
              <div className="flex flex-col space-y-3 py-8">
                <Skeleton className="flex h-[100px] rounded-xl" />
                <div className="space-y-2 ">
                  <Skeleton className="flex h-4" />
                  <Skeleton className="flex h-4" />
                </div>
              </div>
            </>
          ) : (
            <>{profile.length !== 0 ? <Details /> : <></>}</>
          )}
        </SheetContent>
      </Sheet>
      <ForceGraph3D
        graphData={state}
        nodeAutoColorBy={"label"}
        // linkAutoColorBy={"label"}
        height={displayHeight}
        width={displayWidth}
        nodeLabel={"id"}
        onNodeClick={(event: { id: string }) => {
          setName(event.id);
          setOpen(true);
        }}
        nodeThreeObject={(node: NodeObject) => {
          if (typeof node.id !== "string") {
            return;
          }
          const sprite = new SpriteText(node.id);
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        }}
        linkThreeObjectExtend={true}
        //   linkThreeObject={(link) => {
        //     // extend link with text sprite
        //     const sprite = new SpriteText(`${link.source} > ${link.target}`);
        //     sprite.color = "lightgrey";
        //     sprite.textHeight = 1.5;
        //     return sprite;
        //   }}
        //   linkPositionUpdate={(sprite, { start, end }) => {
        //     const middlePos = Object.assign(
        //       ...["x", "y", "z"].map((c) => ({
        //         [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
        //       }))
        //     );

        //     // Position sprite
        //     Object.assign(sprite.position, middlePos);
        //   }}
      />
    </main>

    // </div>
  );
}
