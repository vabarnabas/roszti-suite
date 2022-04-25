import { stat } from "fs"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { VscSymbolString } from "react-icons/vsc"
import { useQuery, useQueryClient } from "react-query"
import Layout from "../../components/layout"
import Spinner from "../../components/spinner/spinner"

interface ROszTIDataType {
  event: string
  point: string
}

const OpenROszTI = () => {
  const [queryCode, setQueryCode] = useState("")
  const router = useRouter()
  const { q: code } = router.query

  const {
    data: ROszTIData,
    status,
    refetch,
  } = useQuery(
    "roszti-data",
    async () => {
      const res = await fetch(
        `https://us-central1-open-roszti.cloudfunctions.net/app/users/data/${queryCode}?range=2021-2022%20tavasz%20events`
      )
      return res.json()
    },
    {
      enabled: false,
    }
  )

  useEffect(() => {
    const fetchIfCode = async () => {
      if (router.isReady && code) {
        await setQueryCode(Array.isArray(code) ? code[0] : code)
        await refetch()
      }
    }

    fetchIfCode()
  }, [router.isReady])

  useEffect(() => {
    if (ROszTIData?.message) {
      router.reload()
    }
  }, [ROszTIData])

  return (
    <Layout>
      {status === "loading" ? (
        <Spinner />
      ) : (
        <div className="w-full h-full flex flex-col items-start justify-start py-6 px-8">
          {!ROszTIData && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                refetch()
              }}
              className="w-full"
            >
              <p className="text-xl font-bold mb-6">
                openRÖszTI<span className="text-soft-green text-sm">v6.5</span>
              </p>
              <div className="relative flex items-center">
                <VscSymbolString className="absolute left-2" />
                <input
                  type="text"
                  value={queryCode}
                  required
                  onChange={(e) =>
                    setQueryCode(e.target.value.toLocaleUpperCase().slice(0, 6))
                  }
                  placeholder="RÖszTI Code"
                  className="form-input-field"
                />
              </div>
              <p className="text-xs inline-block mt-1">
                <span className="font-semibold text-soft-green">Hint:</span> the
                code was sent in a mail previously.
              </p>
              <button className="bg-soft-green hover:bg-darker-soft-green py-1 px-4 rounded-md text-slate-50 w-full text-sm mt-3">
                Next
              </button>
            </form>
          )}
          {ROszTIData && !ROszTIData?.message && (
            <div className="w-full grid lg:grid-cols-2 mb-3 gap-x-4 gap-y-2">
              <div className="grid w-full grid-flow-col gap-x-6 items-center justify-center bg-slate-50 py-1 px-4 rounded-md">
                <div className="flex items-center justify-center flex-col">
                  <p className="font-bold">
                    {ROszTIData[ROszTIData.length - 2]?.point}
                  </p>
                  <p className="text-sm text-center">Elért Pontszám</p>
                </div>
                {parseInt(ROszTIData[ROszTIData.length - 2]?.point) < 6 ? (
                  <p className="text-xs">
                    Még
                    <span className="mx-1 text-soft-green font-semibold">
                      {6 - parseInt(ROszTIData[ROszTIData.length - 2]?.point)}
                    </span>
                    pontot kell elérned az aktív tagsághoz.
                    <span className="text-soft-green hover:underline cursor-pointer">
                      Tovább az elkövetkező eseményekhez.
                    </span>
                  </p>
                ) : (
                  <p className="text-xs">
                    Már elérted az aktív tagsághoz elegendő pontot, viszont még
                    rengeteg esemény vár rád!
                  </p>
                )}
              </div>
              <div className="grid w-full grid-flow-col gap-x-6 items-center justify-center bg-slate-50 py-1 px-4 rounded-md">
                <div className="flex items-center justify-center flex-col">
                  <p className="font-bold">
                    {ROszTIData[ROszTIData.length - 1]?.point}
                  </p>
                  <p className="mr-2 text-sm text-center">Szavazati Jog</p>
                </div>
                <p className="">
                  {" "}
                  {ROszTIData[ROszTIData.length - 3]?.point === "Not Active" ? (
                    <p className="text-xs">
                      Sajnos jelenleg ebben a félévben, még{" "}
                      <span className="text-soft-green">nem</span> érted el, az
                      aktív tagság követelményeit.
                    </p>
                  ) : (
                    <p className="text-xs">
                      Gratulálunk, ebben a félévben az{" "}
                      <span className="text-soft-green">aktív tagságot</span>{" "}
                      erősíted. Reméljük sok eseményen látunk majd!
                    </p>
                  )}
                </p>
              </div>
            </div>
          )}
          {ROszTIData && !ROszTIData?.message && (
            <div className="w-full mt-3 ">
              <p className="mb-1text-sm">Események</p>
              <div className="w-full grid-cols-1 lg:grid-cols-2 grid gap-x-4 gap-y-2">
                {ROszTIData.slice(0, ROszTIData.length - 3).map(
                  (item: ROszTIDataType) => (
                    <div
                      key={item.event + item.point}
                      className="flex items-center justify-between bg-slate-50 py-2 px-4 rounded-md"
                    >
                      <p className="">{item.event}</p>
                      <p className="font-semibold">{item.point}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default OpenROszTI