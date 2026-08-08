import { PlanItemsEditor } from '@/components/planItems/PlanItemsEditor';

export default function GeneralPlan() {
  return (
    <PlanItemsEditor
      section="general_plan"
      title="الخطة العامة"
      description="إدارة بنود الخطة العامة (الرؤية، الرسالة، الأهداف، التوصيات، طريقة التنفيذ...) الظاهرة في صفحة الرئيسية للمستخدمين"
    />
  );
}
