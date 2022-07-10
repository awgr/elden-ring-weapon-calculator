import { ReactNode, useMemo } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  allAttributes,
  DamageType,
  PassiveType,
  Weapon,
  WeaponAttackResult,
} from "../calculator/calculator";
import {
  getAttributeLabel,
  getDamageTypeIcon,
  getDamageTypeLabel,
  getPassiveTypeIcon,
  getScalingLabel,
} from "./uiUtils";
import { useAppState } from "./AppState";

export type WeaponTableRow = [Weapon, WeaponAttackResult];

const getRowId = ([weapon]: WeaponTableRow) => weapon.name;

const blankIcon = <RemoveIcon color="disabled" fontSize="small" />;

const TextAndIcon = ({
  text,
  iconPath,
  tooltip,
}: {
  text: ReactNode;
  iconPath: string | string[];
  tooltip: string;
}) => (
  <Tooltip
    sx={{
      display: "grid",
      gridAutoFlow: "column",
      alignItems: "center",
      justifyContent: "start",
      gap: 1,
    }}
    title={tooltip}
  >
    <Box>
      {(Array.isArray(iconPath) ? iconPath : [iconPath]).map((iconPath) => (
        <img key={iconPath} src={iconPath} alt="" width={24} height={24} />
      ))}
      {text}
    </Box>
  </Tooltip>
);

const passiveBuildupColumn: GridColDef<WeaponTableRow, [PassiveType, number][]> = {
  headerName: "Status",
  field: "passiveBuildup",
  width: 150,
  sortingOrder: ["desc", "asc"],
  valueGetter: ({ row: [, { passiveBuildup }] }) => {
    const buildups = Object.entries(passiveBuildup) as [PassiveType, number][];
    return buildups.sort(([, buildup1], [, buildup2]) => buildup2 - buildup1);
  },
  // For sorting purposes, just use the highest status buildup I guess. Ideally we would
  // support sorting by a single status.
  sortComparator: (buildups1, buildups2) => {
    const n = Math.max(buildups1.length, buildups2.length);
    for (let i = 0; i < n; i++) {
      if (buildups1[i]?.[1] !== buildups2[i]?.[1]) {
        return (buildups1[i]?.[1] ?? 0) - (buildups2[i]?.[1] ?? 0);
      }
    }

    return 0;
  },
  renderCell: ({ value: buildups }) => {
    if (buildups == null || buildups.length === 0) {
      return blankIcon;
    }

    return (
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        {buildups.map(([passiveType, buildup]) => (
          <TextAndIcon
            key={passiveType}
            text={Math.floor(buildup)}
            iconPath={getPassiveTypeIcon(passiveType)}
            tooltip={`${Math.floor(buildup)} ${passiveType} Buildup`}
          />
        ))}
      </Box>
    );
  },
};

function useColumns(): GridColDef<WeaponTableRow>[] {
  const { splitDamage } = useAppState();
  return useMemo(
    () => [
      {
        headerName: "Weapon",
        field: "name",
        sortingOrder: ["asc", "desc"],
        flex: 1,
        minWidth: 320,
        valueGetter: ({ row: [weapon] }) => weapon.name,
        renderCell: ({ row: [weapon] }) => (
          <Button
            sx={{ width: "100%", justifyContent: "start", userSelect: "all" }}
            variant="text"
            href={`https://eldenring.wiki.fextralife.com/${weapon.metadata.weaponName.replace(
              " ",
              "+",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {weapon.name.replace("Epee", "Épée")}
          </Button>
        ),
      },
      {
        headerName: "Attack",
        field: "attackPower",
        width: splitDamage ? 256 : 128,
        sortingOrder: ["desc", "asc"],
        // For sorting purposes, just use the total attack power I guess. Ideally we would
        // support sorting by a single damage type.
        valueGetter: ({ row: [, { attackRating }] }) =>
          Object.values(attackRating).reduce(
            (sum, attackPower) =>
              sum + attackPower.baseAttackPower + attackPower.scalingAttackPower,
            0,
          ),
        renderCell: ({ value, row: [, { attackRating }] }) => {
          const damageTypes = Object.keys(attackRating) as DamageType[];

          if (splitDamage) {
            return (
              <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {damageTypes.map((damageType) => {
                  const { baseAttackPower, scalingAttackPower } = attackRating[damageType]!;
                  const displayedAttackPower = Math.floor(baseAttackPower + scalingAttackPower);
                  return (
                    <TextAndIcon
                      key={damageType}
                      iconPath={getDamageTypeIcon(damageType)}
                      text={displayedAttackPower}
                      tooltip={`${displayedAttackPower} ${getDamageTypeLabel(damageType)} Attack`}
                    />
                  );
                })}
              </Box>
            );
          }

          const displayedAttackPower = Math.floor(value);
          const displayedDamageTypes =
            damageTypes.length === 1
              ? damageTypes
              : damageTypes.filter((damageType) => damageType !== "physical");

          return (
            <TextAndIcon
              iconPath={displayedDamageTypes.map(getDamageTypeIcon)}
              text={displayedAttackPower}
              tooltip={`${displayedAttackPower} ${damageTypes
                .map(getDamageTypeLabel)
                .join("/")} Attack`}
            />
          );
        },
      },
      passiveBuildupColumn as GridColDef<WeaponTableRow>,
      ...allAttributes.map(
        (attribute): GridColDef<WeaponTableRow> => ({
          headerName: attribute,
          field: `${attribute}Scaling`,
          sortingOrder: ["desc", "asc"],
          hideSortIcons: true,
          headerAlign: "center",
          align: "center",
          minWidth: 0,
          width: 40,
          valueGetter: ({ row: [weapon] }) => weapon.attributeScaling[attribute] ?? 0,
          renderHeader: () => (
            <Tooltip title={`${getAttributeLabel(attribute)} Scaling`}>
              <span>{attribute}</span>
            </Tooltip>
          ),
          renderCell: ({ value }) => (value === 0 ? blankIcon : getScalingLabel(value)),
        }),
      ),
      ...allAttributes.map(
        (attribute): GridColDef<WeaponTableRow> => ({
          headerName: attribute,
          field: `${attribute}Requirement`,
          sortingOrder: ["desc", "asc"],
          hideSortIcons: true,
          headerAlign: "center",
          align: "center",
          minWidth: 0,
          width: 40,
          valueGetter: ({ row: [weapon] }) => weapon.requirements[attribute] ?? 0,
          renderHeader: () => (
            <Tooltip title={`${getAttributeLabel(attribute)} Requirement`}>
              <span>{attribute}</span>
            </Tooltip>
          ),
          renderCell: ({ value, row: [, { ineffectiveAttributes }] }) => {
            if (value === 0) {
              return blankIcon;
            }

            if (ineffectiveAttributes.includes(attribute)) {
              return (
                <Tooltip
                  title={`Unable to wield this weapon effectively with present ${getAttributeLabel(
                    attribute,
                  )} stat`}
                >
                  <Typography sx={{ color: (theme) => theme.palette.error.main }}>
                    {value}
                  </Typography>
                </Tooltip>
              );
            }

            return value;
          },
        }),
      ),
    ],
    [splitDamage],
  );
}

interface Props {
  rows: WeaponTableRow[];
}

const WeaponTable = ({ rows }: Props) => {
  const columns = useColumns();
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      density="compact"
      sx={(theme) => ({
        borderLeftWidth: { xs: 0, md: 1 },
        borderRightWidth: { xs: 0, md: 1 },
        borderRadius: { xs: 0, md: `${theme.shape.borderRadius}px` },
        mx: { xs: -3, md: 0 },
      })}
      disableSelectionOnClick
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      autoHeight
      pageSize={50}
    />
  );
};

export default WeaponTable;
