import HelperDetailPage from "@/components/HelperDetailPage";

export default async function HelperDashboard({params} : {params: Promise<{helper_id: string}>}) {
    const {helper_id} = await params;
    return <HelperDetailPage helper_id={helper_id} />
}